import Cache from './cache';
import axios from 'axios';
import * as logger from '../logger';

const client = axios.create();
client.defaults.timeout = 5000;

export default class AgentInformation extends Cache {
  constructor(...args) {
    super(...args);

    // Set the key to profile
    this.key = 'mock-agent-information';
  }

  api(id, data) {
    if (!id) {
      return Promise.reject(new Error('Cannot load agent data without an agent username.'));
    }

    const url = `${data.coreUrl}/mock-agent-information?agentId=${data.agentId}&profileId=${data.profileId}`;

    return client
      .get(url)
      .then(({ data }) => {
        // Cache in redis and return the data
        return this.saveCache(data.agentSession.agentId, data);
      })
      .catch((e) => {
        logger.error('call', e.message, e);
        return Promise.resolve();
      });
  }
};
