import 'dotenv/config'

import { LoggerOptionsWithTransports } from 'express-winston'
import { format, LoggerOptions } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

export const optionsForGlobalLogger = (): LoggerOptions => ({
  transports: [
    new DailyRotateFile({
      filename: 'iviche-errors.%DATE%.log',
      dirname: process.env.LOGGING_OUTPUT_DIR || './logs',
      datePattern: 'YYYY-MM-DD-HH',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
    }),
    new DailyRotateFile({
      filename: 'iviche.%DATE%.log',
      dirname: process.env.LOGGING_OUTPUT_DIR || './logs',
      datePattern: 'YYYY-MM-DD-HH',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'debug',
    }),
  ],
  level: process.env.LOGGING_LEVEL || 'error',
  exitOnError: false,
  format: format.combine(format.timestamp(), format.json()),
})

export const optionsForExpressLogger = (): LoggerOptionsWithTransports => ({
  transports: [
    new DailyRotateFile({
      filename: 'express.%DATE%.log',
      dirname: process.env.LOGGING_OUTPUT_DIR || './logs',
      datePattern: 'YYYY-MM-DD-HH',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
  level: process.env.LOGGING_EXPRESS_REQ_LEVEL || 'error',
  format: format.combine(format.timestamp(), format.json()),
  expressFormat: true,
  msg: 'HTTP {{req.method}} : {{res.statusCode}} ({{res.responseTime}}ms) {{req.url}}',
})
