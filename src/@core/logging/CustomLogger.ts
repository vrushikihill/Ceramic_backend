import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const infoAndWarnFilter = winston.format((info) => {
  return info.level === 'info' || info.level === 'warn' ? info : false;
});
const errorFilter = winston.format((info) => {
  return info.level === 'error' ? info : false;
});
const debugFilter = winston.format((info) => {
  return info.level === 'debug' ? info : false;
});

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    all: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'grey',
    all: 'white',
  },
};

/** Logging winston setup * */
export class CustomLogger {
  myFormat: winston.Logform.Format = null;
  createLoggerConfig: winston.LoggerOptions = null;
  constructor() {
    this.myFormat = winston.format.printf(
      ({ level = 'info', message, timestamp, req, err, ...metadata }) => {
        if (!req) {
          req = { headers: {} };
        }

        let msg = `${timestamp} [${level}] : ${message} `;
        const json: any = {
          timestamp,
          level,
          ...metadata,
          message,
          error: {},
        };

        if (err) {
          json.error = err.stack || err;
        }

        try {
          msg = JSON.stringify(json);
        } catch (e) {
          console.log({ json, e });
        }
        return msg;
      },
    );

    this.createLoggerConfig = {
      /** Warn level Also includes error * */
      levels: customLevels.levels,
      level: 'all',
      format: winston.format.combine(
        winston.format.splat(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        this.myFormat,
      ),
      exitOnError: false,
      transports: [
        new winston.transports.Console({
          level: 'all',
        }),
        new DailyRotateFile({
          filename: `logs/debug_log-%DATE%.log`,
          zippedArchive: false,
          maxSize: '20m',
          maxFiles: '1d',
          format: winston.format.combine(debugFilter()),
          level: 'debug',
        }),
        new DailyRotateFile({
          filename: `logs/error_log-%DATE%.log`,
          zippedArchive: false,
          maxSize: '20m',
          maxFiles: '1d',
          format: winston.format.combine(errorFilter()),
          level: 'error',
        }),
        new DailyRotateFile({
          filename: `logs/info_log-%DATE%.log`,
          zippedArchive: false,
          maxSize: '20m',
          maxFiles: '1d',
          format: winston.format.combine(infoAndWarnFilter()),
          level: 'info',
        }),
        // Other transports
      ],
    };
  }
}
