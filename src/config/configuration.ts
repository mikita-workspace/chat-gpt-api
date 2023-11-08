export const configuration = () => ({
  api: {
    name: process.env.API_NAME || '',
  },
  externalApis: {
    telegram: 'https://api.telegram.org',
  },
  tokens: {
    telegram: process.env.TELEGRAM_TOKEN || '',
  },
  port: parseInt(process.env.PORT, 10) || 5050,
  mongodb: {
    database: {
      connectionString: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      databaseName: process.env.MONGODB_NAME || 'local',
    },
  },
  jwt: {
    accessExp: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME || 60,
    accessSecret: process.env.JWT_ACCESS_TOKEN_SECRET || '',
  },
  http: {
    timeout: process.env.HTTP_TIMEOUT || 10000,
    maxRedirects: process.env.HTTP_MAX_REDIRECTS || 5,
  },
});
