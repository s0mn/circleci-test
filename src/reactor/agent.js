import Cache from './cache';
import axios from 'axios';

const client = axios.create();
client.defaults.timeout = 5000;

export default class Agent extends Cache {
  constructor(...args) {
    super(...args);

    // Set the key to profile
    this.key = 'agent';
  }

  api(id, data) {
    if (!data.agentUsername && !data.agentId) {
      return Promise.reject(new Error('Cannot load agent data without an agentUsername or agentId provided.'));
    }

    const url = `https://${this.env.prefix}shared-api.rv-api.redventures.net/agent/${data.agentId}`;
    return client
      .get(url)
      .then(({ data }) => {
        // Cache in redis and return the data
        return this.saveCache(data.agentId, data);
      })
      .catch(() => {
        return Promise.resolve(data.agent);
      });
  }
};
