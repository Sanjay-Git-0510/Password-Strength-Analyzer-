const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passwordRoutes = require('./routes/password');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', false);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
}));
app.options('*', cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));
app.disable('x-powered-by');

app.use('/api', passwordRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({ error: 'Something went wrong.' });
});

app.listen(PORT, () => {
  console.log(`\n🔐 Password Strength Analyzer API`);
  console.log(`📡 Running on http://localhost:${PORT}`);
  console.log(`✅ CORS enabled for localhost:3000`);
  console.log(`🔒 Passwords are NEVER stored or logged\n`);
});

module.exports = app;