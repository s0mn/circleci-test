import {
  isEmpty,
  get,
  merge,
} from 'lodash';
import { Client, Adapters } from 'rv-decree-client';
import * as logger from '../logger';

export default function (data, client) {
  return new Promise((resolve, reject) => {
    let err = '';
    if (isEmpty(data.environment)) {
      err = 'Environment data is necessary to run Decree';
    } else if (isEmpty(data.profile)) {
      err = 'Profile data is necessary to run Decree';
    } else if (isEmpty(data.profile.atomConfig)) {
      err = 'apiKey is necessary to run Decree';
    }

    if (err) {
      logger.error('decree', err, data);
      return reject(new Error(err));
    }

    const environment = get(data, 'environment.environment');
    const decreeConfig = {
      apiKey: data.profile.atomConfig.decreeApiKey,
      env: get(data, 'initialParams.decreeEnv', null) || environment,
    };
    const Decree = new Client({
      adapter: new Adapters.Http(decreeConfig),
    });

    Decree.runRuleCollection({
      simple: true,
      context: data,
      ruleCollection: JSON.parse(data.profileRules.ruleCollection),
    }, (err, response) => {
      if (err) {
        logger.error('decree', 'Error running rule collection in decree loader', data);
        return reject(err);
      }
      const scenario = {
        scenario: {},
      };

      if (response.Type === 'Scenario') {
        scenario.scenario.scenarioId = +response.Value;
      }

      if (response.Type === 'Tagged Scenario') {
        scenario.scenario.tagId = +response.Value;
      }

      return resolve(merge(data, scenario));
    });
  });
}
