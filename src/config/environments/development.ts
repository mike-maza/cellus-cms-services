import { IEnvironmentConfig } from '../contracts/IEnvironmentConfig';

export const developmentConfig: IEnvironmentConfig = {
  name: 'development',
  port: parseInt(process.env.PORT || '23286'),
  nodeEnv: 'development',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'CellusPayments_Dev',
    trustServerCertificate: true,
    requestTimeout: 60000,
    connectionTimeout: 60000
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0')
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h',
    refreshExpiresIn: '7d'
  },

  encryption: {
    secret: process.env.ENCRYPTION_SECRET || 'your-encryption-secret-32-chars'
  },

  cors: {
    origins: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },

  logging: {
    level: 'debug',
    format: 'dev'
  },

  email: {
    provider: 'nodemailer',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    }
  },

  storage: {
    provider: 'local', // 'google-cloud', 'aws-s3'
    googleCloud: {
      projectId: process.env.GCP_PROJECT_ID || '',
      keyFilename: process.env.GCP_KEY_FILE || '',
      bucketName: process.env.GCP_BUCKET_NAME || ''
    }
  }
};