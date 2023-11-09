export const configuration = () => ({
  api: {
    name: process.env.API_NAME || '',
  },
  telegram: {
    token: process.env.TELEGRAM_TOKEN || '',
  },
  openAi: {
    token: process.env.OPEN_AI_TOKEN || '',
    organization: process.env.OPEN_AI_ORG || '',
  },
  sber: {
    token: process.env.GIGA_CHAT_TOKEN || '',
  },
  port: parseInt(process.env.PORT, 10) || 5050,
  mongodb: {
    database: {
      connectionString: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      databaseName: process.env.MONGODB_NAME || 'local',
    },
  },
  jwt: {
    accessExp: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME, 10) || 60000,
    accessSecret: process.env.JWT_ACCESS_TOKEN_SECRET || '',
  },
  http: {
    timeout: parseInt(process.env.HTTP_TIMEOUT, 10) || 10000,
    maxRedirects: parseInt(process.env.HTTP_MAX_REDIRECTS, 10) || 5,
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 60,
  },
});
