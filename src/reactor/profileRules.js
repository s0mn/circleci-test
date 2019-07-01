import Cache from './cache';
import axios from 'axios';
import * as logger from '../logger';

const client = axios.create();
client.defaults.timeout = 5000;
const environmentalize = (env) => {
  switch (env.environment) {
    case 'dev':
    case 'train':
    case 'test':
    case 'qa':
      return 'https://test-shared-api.rv-api.redventures.net';
    case 'beta':
    case 'production':
      return 'https://shared-api.rv-api.redventures.net';
  }
}

export default class ProfileRules extends Cache {
  constructor(...args) {
    super(...args);

    // Set the key to profile
    this.key = 'profilerules';
  }

  api(profileId) {
    return new Promise((resolve, reject) => {
      client.get(`${environmentalize(this.env)}/rules/profile/${profileId}`)
      .then((res) => {
        if (!res.data.ruleCollection) {
          throw new Error('No rule collection returned')
        }

        return this.saveCache(profileId, res.data).then(resolve);
      })
      .catch((err) => {
        logger.error('profilerule', err.message, err.data);
        return reject(err);
      });
    })
  }
}

