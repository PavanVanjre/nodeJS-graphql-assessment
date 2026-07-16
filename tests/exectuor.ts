import { createYoga } from 'graphql-yoga';
import { parse, print, type DocumentNode } from 'graphql';
import { genSchema } from '../src/schema';
import plugins from '../src/envelop/index';

type TestExecutorRequest = {
  document?: DocumentNode;
  query?: string;
  variables?: Record<string, unknown>;
  headers?: Record<string, string>;
};

console.profile = jest.fn();
const schema = genSchema();
const yoga = createYoga({ schema, plugins });

export const executor = async ({ document, query, variables, headers = {} }: TestExecutorRequest) => {
  const body = JSON.stringify({
    query: document ? print(document) : query,
    variables,
  });

  const response = await yoga.fetch('http://localhost/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body,
  });

  return response.json();
};