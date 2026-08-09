const env = require('./env');

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = [env.CORS_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'];
    if (allowed.includes(origin)) return callback(null, true);
    callback(new Error('Origem não permitida'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
  maxAge: 86400,
};

module.exports = corsOptions;