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
    });

    expect(result).toEqual({
      "data": {
        "address": {
          street: '123 Street St.',
          city: 'Sometown',
          zipcode: '43215',
        }
      }
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
});
