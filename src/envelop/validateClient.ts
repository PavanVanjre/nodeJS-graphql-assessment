import type { Plugin } from '@envelop/core';
import { GraphQLError, Kind, type DocumentNode, type OperationDefinitionNode } from 'graphql';
import { ContextType } from '../types';

const getOperationType = (document: DocumentNode): string | undefined => {
  const operationDefinition = document.definitions.find(
    (definition): definition is OperationDefinitionNode => definition.kind === Kind.OPERATION_DEFINITION
  );

  return operationDefinition?.operation;
};

export const validateClient = (): Plugin<ContextType> => {
  return {
    onParse({ context, extendContext }) {
      const request = (context as any).request;
      const req = (context as any).req;
      const headers = request?.headers ?? req?.headers ?? (context as any).headers;

      const getHeader = (name: string): string | undefined => {
        if (typeof headers?.get === 'function') {
          return headers.get(name) ?? undefined;
        }

        return headers?.[name] ?? headers?.[name.toLowerCase()] ?? undefined;
      };

      const clientHeader = getHeader('client');

      // Attach client to context (may be undefined). If a logger exists, set the client on it.
      extendContext({ client: clientHeader });
      if (!clientHeader) {
        if ((context as any).logger && typeof (context as any).logger.error === 'function') {
          (context as any).logger.error('validateClient', { issue: 'Missing required header: client' });
        }
      } else {
        if ((context as any).logger && typeof (context as any).logger.setClient === 'function') {
          (context as any).logger.setClient(clientHeader);
        }
      }
    },

    onExecute({ args, context }) {
      const clientHeader = (context as any).client;
      const operationType = getOperationType(args.document);

      // Enforce missing client header here so appendResponseMetadata can run and
      // append the requestId even when the request is rejected.
      if (!clientHeader) {
        if ((context as any).logger && typeof (context as any).logger.error === 'function') {
          (context as any).logger.error('validateClient', { issue: 'Missing required header: client' });
        }
        const requestId = (context as any).requestId ?? (context as any).logger?.requestId;
        throw new GraphQLError('Missing required header: client', {
          extensions: { metadata: { requestId } },
        });
      }

      if (typeof clientHeader === 'string' && clientHeader.toLowerCase() === 'strata' && operationType === 'mutation') {
        const requestId = (context as any).requestId ?? (context as any).logger?.requestId;
        throw new GraphQLError('Mutations are not allowed for client: strata', {
          extensions: { metadata: { requestId } },
        });
      }
    },
  };
};
