import { processConfig } from '@graphql-mesh/config';
import { defaultImportFn } from '@graphql-mesh/utils';
import { getInContextSDK, getMesh } from '@graphql-mesh/runtime';

const meshConfig = require('../.meshrc.json');

let meshSdkPromise: Promise<Record<string, any>> | undefined;

export const getMeshSdk = async (): Promise<Record<string, any>> => {
  if (!meshSdkPromise) {
    meshSdkPromise = (async () => {
      const processedConfig = await processConfig(meshConfig, {
        dir: process.cwd(),
        importFn: defaultImportFn,
      });

      const mesh = await getMesh(processedConfig);
      const sdk = getInContextSDK(mesh.schema, mesh.rawSources, mesh.logger, []);
      return sdk;
    })();
  }
  return meshSdkPromise;
};
