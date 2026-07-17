import { createAddress, getAddress } from "./address/address";
import { nearEarthObjects } from "./nearEarthObjectsResolver";
import { Address, Args, CreateAddressInput } from "./address/types";

export const resolvers = {
  Query: {
    address: (parent: any, args: Args, context: any, info: any): Address => {
      return getAddress(parent, args, context);
    },
    nearEarthObjects: (parent: any, args: { startDate: string; endDate: string }, context: any, info: any) => {
      return nearEarthObjects(parent, args, context, info);
    },
  },
  Mutation: {
    createAddress: (parent: any, args: CreateAddressInput, context: any, info: any): Address => {
      return createAddress(parent, args, context);
    },
  },
};
