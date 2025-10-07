import '@dotenvx/dotenvx/config'

export default {
  dbUser: process.env.DB_USER || '',
  dbPassword: process.env.DB_PASSWORD || '',
  dbServer: process.env.DB_SERVER || '',
  dbPort: process.env.DB_PORT || 1433,
  dbDatabase: process.env.DB_DATABASE || ''
}
