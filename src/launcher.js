import tool from 'atom-tool';
import reactorCore from './reactor/reactorCore';
import log from './logger';
import monitor from './monitoring';
import getAtomData from './launcherGetAtomData';
import getReactorData from './launcherGetReactorData';
import getExtraData from './launcherGetExtraData';
import { LAUNCHER_REACTOR_API } from './constants';

export function launcher(data, client, segment, launchDarkly) {
  return new Promise(async (resolve, reject) => {
    try {
      // Set the environment but add the cache flag
      const environment = new tool.Environment(data.environment);
      // Whether or not to use the cache, this will overwrite what's cached
      environment.cacheDisabled = data.cacheDisabled;
      environment.scenarioEnv = data.scenarioEnv;
      environment.decreeEnv = data.decreeEnv;

      let response = {
        initialParams: data, // Assign the query string as initialParams
        environment,
        profileId: data.profileId || '',
        agentId: data.agentId || '',
        agentUsername: data.agentUsername || '',
        callId: data.callId || '',
        marketingCodeId: data.marketingCodeId,
        scenarioId: data.scenarioId,
        scenarioUrl: data.scenarioUrl,
        scenarioEnv: data.scenarioEnv,
        pod: data.pod,
        tagId: data.tagId,
        contactId: data.contactId,
        serviceableId: data.serviceableId,
        coreUrl: data.coreUrl,
        trackingId: data.trackingId,
        trackingTypeId: data.trackingTypeId,
        mockCall: data.mockCall,
        rope: {
          ropeId: data.ropeId,
        },
        call: {
          callId: data.callId || '',
        },
        agent: {
          token: data.jwt // Assign the jwt
        },
      };

      // Attach reactor info
      response = await monitor('reactor core', segment, async () => {
        return reactorCore(response);
      });

      const user = { key: response.agentId };
      const useReactor = await launchDarkly.getFlag(LAUNCHER_REACTOR_API, user, false);

      if (useReactor) {
        await getReactorData(response, data, client, segment);
        await launchDarkly.track('launcher-reactor-success', user);
      } else {
        await getAtomData(response, data, client, segment);
      }

      await getExtraData(response, data, client, segment);

      // Send back all the response info
      log('call', `${response.call.callId} Resolving all data`);
      return resolve(response);
    } catch (e) {
      if (useReactor) {
        launchDarkly.track('launcher-reactor-failure', user)
      }

      return reject(e)
    } finally {
      await launchDarkly.flushAndClose();
    }
  })
};
