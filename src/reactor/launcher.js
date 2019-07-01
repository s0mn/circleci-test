import Cache from './cache';
import * as logger from '../logger';
import axios from 'axios';

const client = axios.create();
client.defaults.timeout = 5000;

// This class handles getting the HTML for a scenario from either redis
// or from cloudfront which is slow
export default class Launcher extends Cache {
  constructor(...args) {
    super(...args);

    // Set the key to launcher
    this.key = 'launcher';
  }

  get({ publishId, url }) {
    // Lookup the HTML by publish ID
    logger.info(this.key, `Grabbing ${this.key}:${publishId} from cache`);
    return this.getCache(publishId)
    .then((d) => {
      if (!d) {
        // If there's no data then grab from s3
        logger.info(this.key, `No cache getting ${this.key}:${publishId} from API`)
        return this.api({ publishId, url });
      }

      // Return what redis gave us
      return Promise.resolve(d);
    });
  }

  api({ publishId, url }) {
    // This one we're just grabbing the HTML which will be in res.text
    logger.info(this.key, 'Retrieving html ', { url });
    return client.get(url)
    .then((res) => {
      return this.saveCache(publishId, res.data);
    });
  }
};
