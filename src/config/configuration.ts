export const configuration = () => ({
  port: parseInt(process.env.PORT, 10) || 5050,
  mongodb: {
    database: {
      connectionString: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      databaseName: process.env.MONGODB_NAME || 'local',
    },
  },
  jwt: {
    access_exp: process.env.JWT_ACCESS_TOKEN_SECRET || 60,
    access_secret: process.env.JWT_ACCESS_TOKEN_SECRET || '',
  },
});
