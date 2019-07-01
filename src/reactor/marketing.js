import Cache from './cache';
import { get } from 'lodash';
import * as logger from '../logger';
import axios from 'axios';

const client = axios.create();
client.defaults.timeout = 5000;

function buildMarketingFromApiResponse(resp) {
  return {
    marketingCodeId: get(resp, 'marketingCode.marketingCodeId'),
    marketingProgramId: get(resp, 'marketingProgram.marketingProgramId'),
    affiliateId: get(resp, 'marketingProgram.affiliateId'),
    channelId: get(resp, 'marketingChannel.channelId'),
  };
}

export default class Marketing extends Cache {
  constructor(...args) {
    super(...args);

    // Set the key to profile
    this.key = 'marketing';
  }

  api(id, data) {
    const { initialParams, call, profile } = data;
    const marketingCodeId = initialParams.marketingCodeId || call.marketingCodeId;
    const dbName = profile.primaryCompany.databaseName;

    // If they don't have the data it's ok just resolve
    if (!marketingCodeId || !dbName) return Promise.resolve({});

    // template strings ftw
    const url = `https://${this.env.prefix}${dbName}.rv-api.redventures.net/marketing/${marketingCodeId}.json`;

    // Hit RVAPI for marketing data
    return client
      .get(url)
      .then(({ data }) => {
        // build marketing data from response
        let marketingData = {};
        if (data.data) {
          let marketingResp = data.data;

          if (this.env.environment === 'production' && !marketingResp) {
            return Promise.reject('A valid marketing response is required');
          } else if (!marketingResp) {
            marketingResp = {};
          }

          marketingData = buildMarketingFromApiResponse(marketingResp);
          // Cache in redis and return the profile data
          return this.saveCache(marketingCodeId, marketingData);
        }

        return Promise.resolve(marketingData);
      })
      .catch((err) => {
        // Ignore errors to fallback to loading from call
        logger.error('marketing', err.message, err.data);
        return Promise.resolve({});
      });
  }
};
