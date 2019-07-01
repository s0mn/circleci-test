import Cache from './cache';
import axios from 'axios';
import log from '../logger';

const client = axios.create();
client.defaults.timeout = 5000;

const environmentalize = (env) => {
  switch (env) {
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

const SCENARIO = 'scenario';
const TAG = 'tag';

const getPublishType = (query, loaderData) => {
  const queryScenarioId = query.scenarioId || null;
  const scenarioId = loaderData && loaderData.scenario ? loaderData.scenario.scenarioId : null;
  const tagId = query.tagId;

  if (queryScenarioId) {
    return { type: SCENARIO, id: queryScenarioId, key: `scenario:${queryScenarioId}` };
  } else if (tagId) {
    let profileId = null;
    if (query.profileId || loaderData && loaderData.profile) {
      profileId = loaderData.profile.profileId;
    }
    return { type: TAG, id: tagId, key: `tag:${profileId}:${tagId}`, profileId };
  } else if (scenarioId) {
    return { type: SCENARIO, id: scenarioId, key: `scenario:${scenarioId}` };
  }
}

const getActivePublish = (env, publishType) => {
  if (!publishType && !publishType.id) return Promise.reject(new Error('Cannot get active publish, ScenarioID or TagID is required'));

  if (publishType.type === SCENARIO) {
    return client.get(`${environmentalize(env)}/publish/scenario/${publishType.id}/active`);
  } else if (publishType.type === TAG) {
    return client.get(`${environmentalize(env)}/publish/profile/${publishType.profileId}/tag/${publishType.id}/active`);
  }
};

export default class ActivePublish extends Cache {
  constructor(...args) {
    super(...args);

    this.key = 'activepublish';
  }

  async get(query, loaderData) {
    // If cache is turned on then pull from that
    let d = null

    // We only cache scenarios for now, tags are too complex
    const publishType = getPublishType(query, loaderData);

    log('launcher', `Grabbing ${this.key}:${publishType.key} from cache`);

    // Key is a little different for this one cause its either a tag or a scenarioid
    if (publishType.type === SCENARIO) {
      d = await this.getCache(publishType.key);
    }

    if (!d) {
      // If there's no data then call the API
      log(this.key, `No cache getting ${this.key}:${publishType.key} from API`);
      return this.api(query, publishType);
    }

    // Return what redis gave us
    return Promise.resolve(d);
  }

  api(query = {}, publishType = {}) {
    // Reach out to shared-api the active publish's html url
    this.env = query.scenarioEnv || query.environment || process.env.NODE_ENV;

    return getActivePublish(this.env, publishType)
    .then((res) => {
      return this.saveCache(publishType.key, res.data);
    });
  }
};
