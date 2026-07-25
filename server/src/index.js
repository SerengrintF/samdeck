import cors from 'cors'
import express from 'express'
import pg from 'pg'

const { Pool } = pg

const PORT = Number(process.env.PORT) || 8080
const USE_MEMORY = process.env.MEMORY_STORE === '1'
const DATABASE_URL = process.env.DATABASE_URL
const DEFAULT_CORS = [
  'http://localhost:5173',
  'https://samdeck.xyz',
  'https://www.samdeck.xyz',
  'https://serengrintf.github.io',
]
const CORS_ORIGINS = [
  ...new Set([
    ...DEFAULT_CORS,
    ...(process.env.CORS_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  ]),
]

if (!USE_MEMORY && !DATABASE_URL) {
  console.error('DATABASE_URL is required (or set MEMORY_STORE=1 for local smoke)')
  process.exit(1)
}

/** @type {Map<string, { deckId: string, voterId: string, score: number }>} */
const memoryRows = new Map()
/** @type {Map<string, { deckId: string, voterId: string, body: string, updatedAt: string }>} */
const memoryTips = new Map()
const memKey = (deckId, voterId) => `${deckId}\0${voterId}`

const TIP_MAX_LEN = 60
const TIP_LIST_LIMIT = 30

const pool = USE_MEMORY
  ? null
  : new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.PGSSL === '0' ? false : { rejectUnauthorized: false },
    })

async function ensureSchema() {
  if (USE_MEMORY) return
  await pool.query(`
    CREATE TABLE IF NOT EXISTS deck_ratings (
      deck_id TEXT NOT NULL,
      voter_id TEXT NOT NULL,
      score NUMERIC(3,1) NOT NULL CHECK (score >= 0.5 AND score <= 5 AND (score * 2) = FLOOR(score * 2)),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (deck_id, voter_id)
    );
    CREATE INDEX IF NOT EXISTS deck_ratings_deck_id_idx ON deck_ratings (deck_id);

    CREATE TABLE IF NOT EXISTS deck_tips (
      deck_id TEXT NOT NULL,
      voter_id TEXT NOT NULL,
      body TEXT NOT NULL CHECK (char_length(body) >= 1 AND char_length(body) <= ${TIP_MAX_LEN}),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (deck_id, voter_id)
    );
    CREATE INDEX IF NOT EXISTS deck_tips_deck_updated_idx ON deck_tips (deck_id, updated_at DESC);
  `)
}

function normalizeTipBody(raw) {
  if (typeof raw !== 'string') return null
  const body = raw.replace(/\s+/g, ' ').trim()
  if (!body || body.length > TIP_MAX_LEN) return null
  return body
}

function publicTip(row, voterId) {
  return {
    body: row.body,
    updatedAt: row.updatedAt,
    mine: Boolean(voterId && row.voterId === voterId),
  }
}

async function listTips(deckId, voterId) {
  if (USE_MEMORY) {
    const rows = [...memoryTips.values()]
      .filter((r) => r.deckId === deckId)
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    const mine = voterId ? rows.find((r) => r.voterId === voterId) : null
    const others = rows.filter((r) => !voterId || r.voterId !== voterId).slice(0, TIP_LIST_LIMIT)
    const ordered = mine ? [mine, ...others.filter((r) => r !== mine)] : others
    return {
      tips: ordered.slice(0, TIP_LIST_LIMIT).map((r) => publicTip(r, voterId)),
      count: rows.length,
      myTip: mine ? mine.body : null,
    }
  }

  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS count FROM deck_tips WHERE deck_id = $1`,
    [deckId],
  )
  const count = Number(countRes.rows[0]?.count || 0)

  let myTip = null
  if (voterId) {
    const mine = await pool.query(
      `SELECT body FROM deck_tips WHERE deck_id = $1 AND voter_id = $2`,
      [deckId, voterId],
    )
    if (mine.rows[0]) myTip = String(mine.rows[0].body)
  }

  const list = await pool.query(
    `
      SELECT body, voter_id, updated_at
      FROM deck_tips
      WHERE deck_id = $1
      ORDER BY
        CASE WHEN voter_id = $2 THEN 0 ELSE 1 END,
        updated_at DESC
      LIMIT $3
    `,
    [deckId, voterId || '', TIP_LIST_LIMIT],
  )

  return {
    tips: list.rows.map((row) =>
      publicTip(
        {
          body: String(row.body),
          voterId: String(row.voter_id),
          updatedAt: new Date(row.updated_at).toISOString(),
        },
        voterId,
      ),
    ),
    count,
    myTip,
  }
}

async function upsertTip(deckId, voterId, body) {
  if (USE_MEMORY) {
    const key = memKey(deckId, voterId)
    if (body == null) memoryTips.delete(key)
    else {
      memoryTips.set(key, {
        deckId,
        voterId,
        body,
        updatedAt: new Date().toISOString(),
      })
    }
    return
  }
  if (body == null) {
    await pool.query(`DELETE FROM deck_tips WHERE deck_id = $1 AND voter_id = $2`, [
      deckId,
      voterId,
    ])
    return
  }
  await pool.query(
    `
      INSERT INTO deck_tips (deck_id, voter_id, body, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (deck_id, voter_id)
      DO UPDATE SET body = EXCLUDED.body, updated_at = NOW()
    `,
    [deckId, voterId, body],
  )
}

function normalizeScore(raw) {
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n) || n <= 0) return null
  const stepped = Math.round(n)
  if (stepped < 1 || stepped > 5) return null
  return stepped
}

function voterIdFrom(req) {
  const id = String(req.header('x-voter-id') || '').trim()
  if (!id || id.length > 80) return null
  return id
}

function round1(n) {
  return Math.round(n * 10) / 10
}

async function statsForDecks(deckIds, voterId) {
  const out = {}
  for (const id of deckIds) {
    out[id] = { average: 0, count: 0, myRating: null }
  }
  if (deckIds.length === 0) return out

  if (USE_MEMORY) {
    const sums = new Map()
    for (const row of memoryRows.values()) {
      if (!deckIds.includes(row.deckId)) continue
      const cur = sums.get(row.deckId) || { sum: 0, count: 0 }
      cur.sum += row.score
      cur.count += 1
      sums.set(row.deckId, cur)
      if (voterId && row.voterId === voterId) {
        out[row.deckId].myRating = row.score
      }
    }
    for (const [deckId, agg] of sums) {
      out[deckId].average = round1(agg.sum / agg.count)
      out[deckId].count = agg.count
    }
    return out
  }

  const agg = await pool.query(
    `
      SELECT deck_id, AVG(score)::float8 AS average, COUNT(*)::int AS count
      FROM deck_ratings
      WHERE deck_id = ANY($1::text[])
      GROUP BY deck_id
    `,
    [deckIds],
  )
  for (const row of agg.rows) {
    out[row.deck_id] = {
      average: round1(Number(row.average)),
      count: Number(row.count),
      myRating: null,
    }
  }

  if (voterId) {
    const mine = await pool.query(
      `
        SELECT deck_id, score::float8 AS score
        FROM deck_ratings
        WHERE voter_id = $1 AND deck_id = ANY($2::text[])
      `,
      [voterId, deckIds],
    )
    for (const row of mine.rows) {
      if (!out[row.deck_id]) {
        out[row.deck_id] = { average: 0, count: 0, myRating: null }
      }
      out[row.deck_id].myRating = Number(row.score)
    }
  }

  return out
}

async function upsertRow(deckId, voterId, score) {
  if (USE_MEMORY) {
    const key = memKey(deckId, voterId)
    if (score == null) memoryRows.delete(key)
    else memoryRows.set(key, { deckId, voterId, score })
    return
  }
  if (score == null) {
    await pool.query(`DELETE FROM deck_ratings WHERE deck_id = $1 AND voter_id = $2`, [
      deckId,
      voterId,
    ])
    return
  }
  await pool.query(
    `
      INSERT INTO deck_ratings (deck_id, voter_id, score, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (deck_id, voter_id)
      DO UPDATE SET score = EXCLUDED.score, updated_at = NOW()
    `,
    [deckId, voterId, score],
  )
}

const app = express()
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true)
      if (CORS_ORIGINS.includes('*') || CORS_ORIGINS.includes(origin)) return cb(null, true)
      return cb(null, false)
    },
  }),
)
app.use(express.json({ limit: '32kb' }))

app.get('/', (_req, res) => {
  res
    .type('html')
    .send(
      '<!doctype html><meta charset="utf-8" /><title>SamDeck API</title>' +
        '<body style="font-family:sans-serif;background:#111;color:#eee;padding:2rem">' +
        '<p>SamDeck 평점·팁 API입니다.</p>' +
        '<p>사이트: <a href="https://samdeck.xyz" style="color:#e0c56a">https://samdeck.xyz</a></p>' +
        '<p>헬스: <a href="/health" style="color:#e0c56a">/health</a></p>' +
        '</body>',
    )
})

app.get('/health', (_req, res) => {
  res.json({ ok: true, memory: USE_MEMORY })
})

app.get('/ratings', async (req, res) => {
  try {
    const raw = String(req.query.deckIds || '')
    const deckIds = [...new Set(raw.split(',').map((s) => s.trim()).filter(Boolean))].slice(0, 200)
    const voterId = voterIdFrom(req)
    const stats = await statsForDecks(deckIds, voterId)
    res.json({ ratings: stats })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'failed_to_fetch_ratings' })
  }
})

app.put('/ratings/:deckId', async (req, res) => {
  try {
    const deckId = String(req.params.deckId || '').trim()
    const voterId = voterIdFrom(req)
    if (!deckId || deckId.length > 120) {
      return res.status(400).json({ error: 'invalid_deck_id' })
    }
    if (!voterId) {
      return res.status(400).json({ error: 'missing_voter_id' })
    }

    const score = req.body?.score == null ? null : normalizeScore(req.body.score)
    if (req.body?.score != null && score == null) {
      return res.status(400).json({ error: 'invalid_score' })
    }

    await upsertRow(deckId, voterId, score)
    const stats = await statsForDecks([deckId], voterId)
    res.json({ rating: stats[deckId] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'failed_to_save_rating' })
  }
})

app.get('/tips/:deckId', async (req, res) => {
  try {
    const deckId = String(req.params.deckId || '').trim()
    if (!deckId || deckId.length > 120) {
      return res.status(400).json({ error: 'invalid_deck_id' })
    }
    const voterId = voterIdFrom(req)
    const data = await listTips(deckId, voterId)
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'failed_to_fetch_tips' })
  }
})

app.put('/tips/:deckId', async (req, res) => {
  try {
    const deckId = String(req.params.deckId || '').trim()
    const voterId = voterIdFrom(req)
    if (!deckId || deckId.length > 120) {
      return res.status(400).json({ error: 'invalid_deck_id' })
    }
    if (!voterId) {
      return res.status(400).json({ error: 'missing_voter_id' })
    }

    const raw = req.body?.text ?? req.body?.body
    const clear = raw == null || (typeof raw === 'string' && raw.trim() === '')
    const body = clear ? null : normalizeTipBody(raw)
    if (!clear && body == null) {
      return res.status(400).json({ error: 'invalid_tip', maxLength: TIP_MAX_LEN })
    }

    await upsertTip(deckId, voterId, body)
    const data = await listTips(deckId, voterId)
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'failed_to_save_tip' })
  }
})

await ensureSchema()
app.listen(PORT, () => {
  console.log(`ratings api listening on :${PORT}${USE_MEMORY ? ' (memory)' : ''}`)
  console.log(`cors origins: ${CORS_ORIGINS.join(', ')}`)
})
