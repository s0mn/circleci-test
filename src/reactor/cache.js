import * as logger from '../logger';
import Promise from 'bluebird';

// Expire in 2 hours
const expiry = 60 * 60 * 2;

const timeoutValue = 15000;

const cache = class Cache {
  constructor(env, client) {
    // Set the environment to our Environment object in atom tool
    this.env = env;

    // The key that represents the model, will
    // be overidden in subclasses
    this.key = 'atom';
    this.timeout = timeoutValue;
    this.expiration = expiry;

    // If the env says don't cache then don't cache
    if (this.env.cacheDisabled) {
      this.cache = false;
    } else {
      this.cache = true;
    }

    // Set the redis client
    this.client = client;
  }

  async get(id, data) {
    // If cache is turned on then pull from that
    let d = null
    logger.info(this.key, `Grabbing ${this.key}:${id} from cache`);
    if (this.cache) {
      // Lookup the thing in redis since cache is on
      try {
        d = await this.getCache(id);
      } catch(e) {
        logger.error(this.key, e.message, e);
      }
    }

    if (!d) {
      // If there's no data then call the API
      logger.info(this.key, `No cache getting ${this.key}:${id} from API`);
      return this.api(id, data);
    }

    // Return what redis gave us
    return Promise.resolve(d);
  }

  async saveCache(id, data) {
    // Save the data
    return new Promise((resolve, reject) => {
      // If cache is disabled just return the object
      if (!this.cache) return resolve(data);

      this.client.set(`atom:${this.env.environment}:${this.key}:${id}`,
        data,
        'EX',
        this.expiration,
        (err) => {
          if (err) return reject(err);
          return resolve(data);
        }
      );
    });
  }

  async getCache(id) {
    return new Promise((resolve, reject) => {
      this.client.get(`atom:${this.env.environment}:${this.key}:${id}`, (err, res) => {
        if (err) return reject(err);
        try {
          return resolve(JSON.parse(res));
        } catch (e) {
          logger.error(this.key, e.message, e);
          return reject(e);
        }
      });
    });
  }
};

cache.timeout = timeoutValue;

export default cache;

