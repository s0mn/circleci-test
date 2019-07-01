import Cache from './cache';
import * as logger from '../logger';
import axios from 'axios';

const client = axios.create();
client.defaults.timeout = 5000;

export default class Call extends Cache {
  constructor(...args) {
    super(...args);

    // Set the key to profile
    this.key = 'call';
  }

  api(id, data) {
    const { call, profile } = data;
    let dbName = profile.primaryCompany.databaseName;
    const callId = call.callId;

    if (!callId) {
      return Promise.resolve({});
    }
    dbName = dbName.toLowerCase();

    // template strings ftw
    const url = `https://${this.env.prefix}${dbName}.rv-api.redventures.net/calldata/${callId}.json`;

    return client
      .get(url)
      .then(({ data }) => {
        let callData = data.data;

        // If no data was found, at least return the callId used to search
        if (!callData) {
          callData = {
            callId,
          };
        }

        const callsCompaniesData = callData.callsCompanies;
        return this.saveCache(callId, {
          call: callData,
          callsCompanies: callsCompaniesData,
        });
      })
      .catch((e) => {
        logger.error('call', e.message, e);
        return Promise.resolve(data.call);
      });
  }
};
