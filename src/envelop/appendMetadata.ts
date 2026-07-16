import type { Plugin } from '@envelop/core';
import { ContextType } from '../types';

export const appendResponseMetadata = (): Plugin<ContextType> => {
  return {
    onExecute() {
      return {
        async onExecuteDone(payload: any) {
          const { result, args, contextValue, context, setResult } = payload;
          try {
            if (!result) return;

            // Skip subscription AsyncIterable results
            if (typeof (result as any)[Symbol.asyncIterator] === 'function') return;

            const requestId =
              args?.contextValue?.requestId ??
              contextValue?.requestId ??
              context?.requestId ??
              args?.contextValue?.logger?.requestId ??
              contextValue?.logger?.requestId ??
              context?.logger?.requestId ??
              (context as any)?.logger?.requestId ??
              undefined;

            const metadata: any = { requestId };

            const newResult = { ...result, metadata };

            if (typeof setResult === 'function') {
              setResult(newResult);
            } else {
              (result as any).metadata = metadata;
            }
          } catch (e) {
            // do not break the response flow on logger/plugin errors
          }
        },
      };
    },
  };
};
