const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Enable CORS (for frontend access)
app.use(cors({
  origin: '*', // Allow all origins for now (you can restrict later)
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// ✅ PostgreSQL connection setup (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:GayathriIndhu@07-silent-smoke-ahsv79yr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

// ✅ Ensure table exists
(async () => {
  const createTable = `
    CREATE TABLE IF NOT EXISTS links (
      id SERIAL PRIMARY KEY,
      code VARCHAR(8) UNIQUE,
      url TEXT UNIQUE NOT NULL,
      clicks INT DEFAULT 0,
      lastclicked TIMESTAMP NULL,
      createdat TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
    );
  `;
  try {
    await pool.query(createTable);
    console.log('✅ Table ensured in Postgres');
  } catch (err) {
    console.error('❌ Error creating table:', err);
  }
})();

// ✅ Health check route
app.get('/healthz', (req, res) => {
  res.status(200).json({
    ok: true,
    version: '1.0',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// ✅ Create short link (prevent duplicate URLs)
app.post('/api/links', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    // Check for duplicate URL
    const existing = await pool.query('SELECT code FROM links WHERE url = $1', [url]);
    if (existing.rows.length > 0) {
      const code = existing.rows[0].code;
      return res.json({
        message: 'Short link already exists!',
        short_url: `https://tinylink-backend-tyfm.onrender.com/${code}`
      });
    }

    // Generate a new short code
    const code = Math.random().toString(36).substring(2, 8);

    await pool.query('INSERT INTO links (code, url) VALUES ($1, $2)', [code, url]);
    res.json({
      message: 'Short link created successfully!',
      short_url: `https://tinylink-backend-tyfm.onrender.com/${code}`
    });
  } catch (err) {
    console.error('Error inserting link:', err);
    res.status(500).json({ error: 'Database insert failed' });
  }
});

// ✅ Fetch all links
app.get('/api/links', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM links ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching links:', err);
    res.status(500).json({ error: 'Database fetch failed' });
  }
});

// ✅ Redirect route (track clicks and time in IST)
app.get('/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const result = await pool.query('SELECT * FROM links WHERE code = $1', [code]);
    if (result.rows.length === 0) return res.status(404).send('Link not found!');

    const link = result.rows[0];
    await pool.query(
      "UPDATE links SET clicks = clicks + 1, lastclicked = (NOW() AT TIME ZONE 'Asia/Kolkata') WHERE code = $1",
      [code]
    );

    console.log(`✅ Redirected ${code} → ${link.url}`);
    res.redirect(link.url);
  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).send('Server error');
  }
});

// ✅ Delete short link
app.delete('/api/links/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const result = await pool.query('DELETE FROM links WHERE code = $1', [code]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Link not found!' });
    }
    res.json({ message: `Link '${code}' deleted successfully!` });
  } catch (err) {
    console.error('Error deleting link:', err);
    res.status(500).json({ error: 'Database delete failed' });
  }
});

// ✅ Start server (for Render)
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
