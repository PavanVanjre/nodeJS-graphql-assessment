import winston from 'winston';

export class Logger {
  private winston: any;
  requestId: string = '';
  constructor() {
    this.winston = winston.createLogger({
      level: 'info',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [new winston.transports.Console()],
    });
  }

  setRequestId(requestId: string) {
    this.requestId = requestId;
  }

  private mergeMeta(meta?: object | string) {
    if (typeof meta === 'string') {
      return { requestId: this.requestId, detail: meta };
    }
    return { requestId: this.requestId, ...(meta ?? {}) };
  }

  info(message: string, meta?: object | string) {
    this.winston.info(message, this.mergeMeta(meta));
  }

  error(message: string, meta?: object | string) {
    this.winston.error(message, this.mergeMeta(meta));
  }

  warn(message: string, meta?: object | string) {
    this.winston.warn(message, this.mergeMeta(meta));
  }
}
