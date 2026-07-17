import { parse } from 'graphql';
import { executor } from '../exectuor';

const mockResponse = {
  element_count: 2,
  near_earth_objects: {
    '2015-09-07': [
      {
        id: '2465633',
        name: '465633 (2009 JR5)',
        is_potentially_hazardous_asteroid: true,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.2914439045,
            estimated_diameter_max: 0.6516883822,
          },
        },
        close_approach_data: [
          {
            close_approach_date: '2015-09-07',
            relative_velocity: {
              kilometers_per_hour: '65161.9443577317',
            },
            miss_distance: {
              kilometers: '66904629.548771968',
            },
          },
        ],
      },
    ],
  },
};

jest.mock('../../src/mesh', () => {
  return {
    getMeshSdk: jest.fn().mockResolvedValue({
      NasaNeoFeed: {
        Query: {
          nearEarthObjects: jest.fn().mockImplementation(() => {
            return Promise.resolve(mockResponse);
          }),
        },
      },
    }),
  };
});

describe('nearEarthObjects query', () => {
  test('Success with correct fields mapped and requestId metadata', async () => {
    const query = `
      query GetNearEarthObjects($startDate: String!, $endDate: String!) {
        nearEarthObjects(startDate: $startDate, endDate: $endDate) {
          elementCount
          objects {
            id
            name
            isPotentiallyHazardousAsteroid
            estimatedDiameterMinKm
            estimatedDiameterMaxKm
            closeApproachDate
            relativeVelocityKph
            missDistanceKm
          }
        }
      }
    `;

    const variables = { startDate: '2015-09-07', endDate: '2015-09-08' };

    const result = await executor({
      document: parse(query),
      variables,
      headers: { client: 'test-client' },
    });

    expect(result).toHaveProperty('data.nearEarthObjects');
    expect(result.data.nearEarthObjects.elementCount).toBeGreaterThan(0);
    expect(Array.isArray(result.data.nearEarthObjects.objects)).toBe(true);
    expect(result.data.nearEarthObjects.objects.length).toBeGreaterThan(0);

    const firstObject = result.data.nearEarthObjects.objects[0];
    expect(firstObject).toHaveProperty('id');
    expect(firstObject).toHaveProperty('name');
    expect(firstObject).toHaveProperty('isPotentiallyHazardousAsteroid');
    expect(firstObject).toHaveProperty('estimatedDiameterMinKm');
    expect(firstObject).toHaveProperty('estimatedDiameterMaxKm');
    expect(firstObject).toHaveProperty('closeApproachDate');
    expect(firstObject).toHaveProperty('relativeVelocityKph');
    expect(firstObject).toHaveProperty('missDistanceKm');

    expect(result).toHaveProperty('metadata.requestId');
    expect(result.metadata.requestId).toEqual(expect.any(String));
  });

  test('fails without client header and returns metadata requestId', async () => {
    const query = `
      query GetNearEarthObjects($startDate: String!, $endDate: String!) {
        nearEarthObjects(startDate: $startDate, endDate: $endDate) {
          elementCount
        }
      }
    `;

    const variables = { startDate: '2015-09-07', endDate: '2015-09-08' };

    const result = await executor({
      document: parse(query),
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

  test('succeeds for client header strata (read-only client)', async () => {
    const query = `
      query GetNearEarthObjects($startDate: String!, $endDate: String!) {
        nearEarthObjects(startDate: $startDate, endDate: $endDate) {
          elementCount
        }
      }
    `;

    const variables = { startDate: '2015-09-07', endDate: '2015-09-08' };

    const result = await executor({
      document: parse(query),
      variables,
      headers: { client: 'strata' },
    });

    expect(result).not.toHaveProperty('errors');
    expect(result).toHaveProperty('data.nearEarthObjects.elementCount');
    expect(result.data.nearEarthObjects.elementCount).toBeGreaterThan(0);
    expect(result).toHaveProperty('metadata.requestId');
  });
});
