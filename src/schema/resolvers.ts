import { createAddress, getAddress } from "./address/address";
import { Address, Args, CreateAddressInput } from "./address/types";

export const resolvers = {
  Query: {
    address: (parent: any, args: Args, context: any, info: any): Address => {
      return getAddress(parent, args, context);
    },
  },
  Mutation: {
    createAddress: (parent: any, args: CreateAddressInput, context: any, info: any): Address => {
      return createAddress(parent, args, context);
    },
  },
};
