export const configuration = () => ({
  api: {
    name: process.env.API_NAME || '',
  },
  cloudinary: {
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  },
  telegram: {
    token: process.env.TELEGRAM_TOKEN || '',
  },
  openAi: {
    organization: process.env.OPEN_AI_ORG || '',
    token: process.env.OPEN_AI_TOKEN || '',
  },
  sber: {
    chatToken: process.env.GIGA_CHAT_TOKEN || '',
    speechToken: process.env.SALUTE_SPEECH_TOKEN || '',
  },
  slack: {
    token: process.env.SLACK_TOKEN || '',
    webhook: process.env.SLACK_WEBHOOK || '',
  },
  github: {
    apiRepo: process.env.GITHUB_REPO_API || '',
    clientRepo: process.env.GITHUB_REPO_CLIENT || '',
    owner: process.env.GITHUB_OWNER || '',
    token: process.env.GITHUB_TOKEN || '',
  },
  port: parseInt(process.env.PORT, 10) || 5050,
  mongodb: {
    database: {
      connectionString: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      databaseName: process.env.MONGODB_NAME || 'local',
    },
  },
  jwt: {
    accessExp: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME, 10) || 3600,
    accessSecret: process.env.JWT_ACCESS_TOKEN_SECRET || '',
  },
  http: {
    maxRedirects: parseInt(process.env.HTTP_MAX_REDIRECTS, 10) || 5,
    timeout: parseInt(process.env.HTTP_TIMEOUT, 10) || 60000,
  },
  cache: {
    redisUrl: process.env.REDIS_URL || '',
    ttl: parseInt(process.env.CACHE_TTL, 10) || 60000,
  },
});
