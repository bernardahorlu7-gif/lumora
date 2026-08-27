require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const projectRoutes = require('./routes/projects');
const quoteRoutes = require('./routes/quotes');
const documentRoutes = require('./routes/documents');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const publicRoutes = require('./routes/public');
const invoiceRoutes = require('./routes/invoices');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// General API rate limit (separate, stricter limit applied to /api/auth/login)
app.use('/api', rateLimit({ windowMs: 60 * 1000, max: 300 }));

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.get('/api/health/db', async (req, res) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ ok: false, database: 'not_configured' });
  try {
    const { query } = require('./db/pool');
    await query('SELECT 1');
    res.json({ ok: true, database: 'connected' });
  } catch (error) {
    console.error('[health] database check failed:', error.message);
    res.status(503).json({ ok: false, database: 'unavailable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/invoices', invoiceRoutes);

// Serve the existing static frontend pages (staff portal, public site, quote builder)
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`[server] Lumora Nexus API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

module.exports = app;
