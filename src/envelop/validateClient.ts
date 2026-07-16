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

      if (!clientHeader) {
        // If a logger is available, log the missing header before rejecting.
        if ((context as any).logger && typeof (context as any).logger.error === 'function') {
          (context as any).logger.error('validateClient', { issue: 'Missing required header: client' });
        }
        throw new GraphQLError('Missing required header: client');
      }

      // Attach client to context and, if a logger exists, set the client on it.
      extendContext({ client: clientHeader });
      if ((context as any).logger && typeof (context as any).logger.setClient === 'function') {
        (context as any).logger.setClient(clientHeader);
      }
    },

    onExecute({ args, context }) {
      const clientHeader = (context as any).client;
      const operationType = getOperationType(args.document);

      if (typeof clientHeader === 'string' && clientHeader.toLowerCase() === 'strata' && operationType === 'mutation') {
        throw new GraphQLError('Mutations are not allowed for client: strata');
      }
    },
  };
};
