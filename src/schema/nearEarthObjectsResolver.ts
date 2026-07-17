import { getMeshSdk } from '../mesh';

const flattenNeoObjects = (nearEarthObjects: Record<string, any[]>): any[] => {
  return Object.values(nearEarthObjects).flatMap((items) =>
    items.map((item) => {
      const closeApproach = item.close_approach_data?.[0] ?? {};
      return {
        id: item.id,
        name: item.name,
        isPotentiallyHazardousAsteroid: item.is_potentially_hazardous_asteroid,
        estimatedDiameterMinKm: item.estimated_diameter?.kilometers?.estimated_diameter_min ?? null,
        estimatedDiameterMaxKm: item.estimated_diameter?.kilometers?.estimated_diameter_max ?? null,
        closeApproachDate: closeApproach.close_approach_date ?? null,
        relativeVelocityKph: closeApproach.relative_velocity?.kilometers_per_hour ?? null,
        missDistanceKm: closeApproach.miss_distance?.kilometers ?? null,
      };
    })
  );
};

import { GraphQLResolveInfo } from 'graphql';

export const nearEarthObjects = async (
  _: any,
  args: { startDate: string; endDate: string },
  context: any,
  info: GraphQLResolveInfo
) => {
  const sdk = await getMeshSdk();
  const { logger, ...meshContext } = context;
  const rawResponse = await sdk.NasaNeoFeed.Query.nearEarthObjects({
    args: {
      start_date: args.startDate,
      end_date: args.endDate,
    },
    context: meshContext,
    selectionSet: `{
      element_count
      near_earth_objects
    }`,
  });

  if (!rawResponse) {
    return {
      elementCount: 0,
      objects: [],
    };
  }

  return {
    elementCount: rawResponse.element_count ?? 0,
    objects: flattenNeoObjects(rawResponse.near_earth_objects ?? {}),
  };
};
