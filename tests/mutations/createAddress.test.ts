import { parse } from 'graphql';
import { executor } from '../exectuor';
import * as fs from 'fs';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn(),
}));

describe('createAddress', () => {
  beforeEach(() => {
    (fs.writeFileSync as jest.Mock).mockClear();
  });

  afterEach(() => {
    (fs.writeFileSync as jest.Mock).mockClear();
  });

  test('success with client header and metadata', async () => {
    const username = `testuser_${Date.now()}`;
    const mutation = `
      mutation CreateAddress($username: String!, $street: String!, $city: String!, $zipcode: String!, $state: String) {
        createAddress(username: $username, street: $street, city: $city, zipcode: $zipcode, state: $state) {
          street
          city
          zipcode
          state
        }
      }
    `;

    const variables = {
      username,
      street: '4567 Oak Ave',
      city: 'Springfield',
      zipcode: '62705',
      state: 'IL',
    };

    const result = await executor({
      document: parse(mutation),
      variables,
      headers: { client: 'test-client' },
    });

    expect(result).toEqual({
      data: {
        createAddress: {
          street: '4567 Oak Ave',
          city: 'Springfield',
          zipcode: '62705',
          state: 'IL',
        },
      },
      metadata: {
        requestId: expect.any(String),
      },
    });
  });

  test('rejects duplicate username with metadata', async () => {
    const mutation = `
      mutation CreateAddress($username: String!, $street: String!, $city: String!, $zipcode: String!, $state: String) {
        createAddress(username: $username, street: $street, city: $city, zipcode: $zipcode, state: $state) {
          street
        }
      }
    `;

    const variables = {
      username: 'jack',
      street: '1 Duplicate St',
      city: 'Copytown',
      zipcode: '11111',
      state: 'DL',
    };

    const result = await executor({
      document: parse(mutation),
      variables,
      headers: { client: 'test-client' },
    });

    expect(result).toHaveProperty('errors');
    expect(result.errors[0].message).toBe('Address already exists for this username');
    expect(result).toHaveProperty('metadata');
    expect(result.metadata).toEqual({
      requestId: expect.any(String),
    });
  });

  test('fails without client header and returns metadata requestId', async () => {
    const mutation = `
      mutation CreateAddress($username: String!, $street: String!, $city: String!, $zipcode: String!, $state: String) {
        createAddress(username: $username, street: $street, city: $city, zipcode: $zipcode, state: $state) {
          street
        }
      }
    `;

    const variables = {
      username: `testuser_no_header_${Date.now()}`,
      street: '1 Test St',
      city: 'Testville',
      zipcode: '99999',
      state: 'TS',
    };

    const result = await executor({
      document: parse(mutation),
      variables,
      headers: {},
    });

    expect(result).toHaveProperty('errors');
    expect(result.errors[0].message).toBe('Missing required header: client');
    expect(result.errors[0].extensions).toMatchObject({
      metadata: {
        requestId: expect.any(String),
      },
    });
  });

  test('rejects mutation for client strata with metadata', async () => {
    const mutation = `
      mutation CreateAddress($username: String!, $street: String!, $city: String!, $zipcode: String!, $state: String) {
        createAddress(username: $username, street: $street, city: $city, zipcode: $zipcode, state: $state) {
          street
        }
      }
    `;

    const variables = {
      username: `testuser_strata_${Date.now()}`,
      street: '123 Fake St',
      city: 'City',
      zipcode: '12345',
      state: 'CA',
    };

    const result = await executor({
      document: parse(mutation),
      variables,
      headers: { client: 'strata' },
    });

    expect(result).toHaveProperty('errors');
    expect(result.errors[0].message).toBe('Mutations are not allowed for client: strata');
    expect(result.errors[0].extensions).toMatchObject({
      metadata: {
        requestId: expect.any(String),
      },
    });
  });
});
