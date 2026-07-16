import type { Plugin } from '@envelop/core';
import { Logger } from '../logger';
import { ContextType } from '../types';

export const useLogger = (): Plugin<ContextType> => {
  return {
    onParse({ context, extendContext }) {
      const logger = new Logger();
      logger.setRequestId(context.requestId);
      // attach client value if available so logger can include it in all entries
      if ((context as any).client) {
        logger.setClient((context as any).client);
      }
      extendContext({ logger: logger });
    },
  };
};
