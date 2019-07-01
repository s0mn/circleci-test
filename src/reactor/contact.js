import Cache from './cache';
import Rope from 'rope-client';
import { get } from 'lodash';

export default class Contact extends Cache {
  constructor(...args) {
    super(...args);

    // Set the key
    this.key = 'contact';
  }

  get(id, data) {
    // Override super to make the api and not use cache
    return this.api(id, data);
  }

  api(contactId, data) {
    // If they didn't pass in ID then resolve empty object
    if (!contactId) return Promise.resolve({});

    // Get the primary company
    const companyId = get(data, 'profile.primaryCompany.companyId', false);
    if (!companyId) return reject(new Error('No companyID returned by contact'));

    const rope = new Rope.Client({
      adapter: new Rope.Adapters.Http({
        env: data.environment.environment,
      }),
    });

    return new Promise((resolve, reject) => {
      rope.getContactById({
        contactId,
        companyId,
      }, (err, contactData) => {
        if (err) {
          return Promise.reject(err);
        }

        const companyId = get(contactData, 'companyId');
        if (!companyId) return reject(new Error('No companyID returned by contact'));

        // Return the contact data
        return resolve({
          [companyId]: {
            ...contactData,
          },
        });
      });
    });
  }
};
