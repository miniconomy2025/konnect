export const config = {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/konnect'
  },
  server: {
    port: parseInt(process.env.PORT || '3000')
  }
}; 