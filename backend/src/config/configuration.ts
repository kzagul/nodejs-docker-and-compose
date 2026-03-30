export default () => ({
  server: {
    port: parseInt(process.env.PORT) || 3000,
  },
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    user: process.env.POSTGRES_USER || 'student',
    password: process.env.POSTGRES_PASSWORD || 'student',
    name: process.env.POSTGRES_DB_NAME || 'kupipodariday',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret-key',
    ttl: process.env.JWT_TTL || '30000s',
  },
});
