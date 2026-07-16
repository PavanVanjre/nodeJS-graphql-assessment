import { writeFileSync } from 'fs';
import { resolve } from 'path';
import addressTable from '../../../data/addresses.json';
import { Addresses, Address, Args, CreateAddressInput } from './types';
import { GraphQLError } from 'graphql';

const addresses = addressTable as Addresses;
const dataFilePath = resolve(process.cwd(), 'data/addresses.json');

const _getAddress = (username: string): Address | null => {
  return addresses[username];
};

export const getAddress = (_: any, args: Args, context: any): Address => {
  context.logger.info('getAddress', 'Enter resolver');
  const address = _getAddress(args.username);
  if (address) {
    context.logger.info('getAddress', 'Returning address');
    return address;
  }
  context.logger.error('getAddress', 'No address found');
  throw new GraphQLError('No address found in getAddress resolver');
};

export const createAddress = (_: any, args: CreateAddressInput, context: any): Address => {
  context.logger.info('createAddress', 'Enter resolver');

  if (addresses[args.username]) {
    context.logger.error('createAddress', 'Address already exists');
    throw new GraphQLError('Address already exists for this username');
  }

  const newAddress: Address = {
    street: args.street,
    city: args.city,
    zipcode: args.zipcode,
    ...(args.state ? { state: args.state } : {}),
  };

  addresses[args.username] = newAddress;
  writeFileSync(dataFilePath, JSON.stringify(addresses, null, 2) + '\n');

  context.logger.info('createAddress', 'Address created');
  return newAddress;
};