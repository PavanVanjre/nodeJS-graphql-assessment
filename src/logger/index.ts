import winston from 'winston';

export class Logger {
  private winston: any;
  requestId: string = '';
  client?: string;
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

  setClient(client?: string) {
    this.client = client;
  }

  private mergeMeta(meta?: object | string) {
    const base: any = { requestId: this.requestId };
    if (this.client) base.client = this.client;
    if (typeof meta === 'string') {
      return { ...base, detail: meta };
    }
    return { ...base, ...(meta ?? {}) };
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
