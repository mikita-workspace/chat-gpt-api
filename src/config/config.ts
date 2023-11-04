export const config = () => ({
  port: parseInt(process.env.PORT, 10) || 5050,
  api: {
    apiUrl: process.env.API_URL,
    httpTimeout: 3000,
  },
  // mongodb: {
  //   database: {
  //     connectionString:
  //       process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017',
  //     databaseName: process.env.NODE_ENV || 'local',
  //   },
  // },
});
