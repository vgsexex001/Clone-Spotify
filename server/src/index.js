import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { initDb } from './db/index.js';
import authRoutes from './routes/auth.js';
import searchRoutes from './routes/search.js';
import musicRoutes from './routes/music.js';
import userRoutes from './routes/user.js';

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any localhost origin
    if (origin.startsWith('http://localhost:')) return callback(null, true);
    callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

initDb();

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/music', musicRoutes);
app.use('/api/v1/user', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
