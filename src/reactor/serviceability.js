import Cache from './cache';
import Rope from 'rope-client';
import { get } from 'lodash';

export default class Serviceability extends Cache {
  constructor(...args) {
    super(...args);

    // Set the key
    this.key = 'serviceability';
  }

  get(id, data) {
    // Override super to make the api and not use cache
    return this.api(id, data);
  }

  api(serviceableId, data) {
    // If they didn't pass in ID then resolve empty object
    if (!serviceableId) return Promise.resolve({});

    // Get the primary company
    const companyId = get(data, 'profile.primaryCompany.companyId', false);

    return new Promise((resolve, reject) => {
      const rope = new Rope.Client({
        adapter: new Rope.Adapters.Http({
          env: data.environment.environment,
        }),
      });

      rope.getServiceable({
        companyId,
        serviceableId,
      }, (err, serviceableData) => {
        if (err) {
          return reject(err);
        }

        return resolve({
          [companyId]: serviceableData,
        });
      });
    });
  }
};
