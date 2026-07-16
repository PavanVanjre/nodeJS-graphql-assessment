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
    onExecute({ args, context }) {
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
        throw new GraphQLError('Missing required header: client');
      }

      const operationType = getOperationType(args.document);

      if (clientHeader.toLowerCase() === 'strata' && operationType === 'mutation') {
        throw new GraphQLError('Mutations are not allowed for client: strata');
      }
    },
  };
};
