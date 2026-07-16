import { parse } from 'graphql';
import { executor } from '../exectuor';

describe('getAddress', () => {
  test('Success', async () => {
    const query = `
            query GetAddress($username: String!) {
                address(username: $username) {
                    street
                    city
                    zipcode
                }
            }
        `;

    const variables = { username: 'jack' };

    const result = await executor({
      document: parse(query),
      variables,
      headers: { client: 'test-client' },
    });

    expect(result).toEqual({
      data: {
        address: {
          street: '123 Street St.',
          city: 'Sometown',
          zipcode: '43215',
        },
      },
      metadata: {
        requestId: expect.any(String),
      },
    });
  });

  test('returns state for a known address', async () => {
    const query = `
            query GetAddress($username: String!) {
                address(username: $username) {
                    street
                    city
                    zipcode
                    state
                }
            }
        `;

    const variables = { username: 'sam' };

    const result = await executor({
      document: parse(query),
      variables,
      headers: { client: 'test-client' },
    });

    expect(result).toEqual({
      data: {
        address: {
          street: '555 New Lane',
          city: 'Metro City',
          zipcode: '75001',
          state: 'TX',
        },
      },
      metadata: {
        requestId: expect.any(String),
      },
    });
  });

  test('Error', async () => {
    const query = `
            query GetAddress($username: String!) {
                address(username: $username) {
                    street
                    city
                    zipcode
                }
            }
        `;

    const variables = { username: 'john' };

    const result = await executor({
      document: parse(query),
      variables,
      headers: { client: 'test-client' },
    });

    expect(result).toEqual(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'No address found in getAddress resolver',
          }),
        ]),
      })
    );
  });

  test('fails without client header and returns requestId metadata', async () => {
    const query = `
            query GetAddress($username: String!) {
                address(username: $username) {
                    street
                    city
                    zipcode
                }
            }
        `;

    const result = await executor({
      document: parse(query),
      variables: { username: 'jill' },
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

  test('returns GraphQLError when address not found but still includes requestId metadata', async () => {
    const query = `
            query GetAddress($username: String!) {
                address(username: $username) {
                    street
                    city
                    zipcode
                }
            }
        `;

    const result = await executor({
      document: parse(query),
      variables: { username: 'doesnotexist' },
      headers: { client: 'test-client' },
    });

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: 'No address found in getAddress resolver',
        }),
      ])
    );
    expect(result).toHaveProperty('metadata');
    expect(result.metadata).toEqual({ requestId: expect.any(String) });
  });
});
