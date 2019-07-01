import Cache from './cache';
import axios from 'axios';

const client = axios.create();
client.defaults.timeout = 5000;

export default class Profile extends Cache {
  constructor(...args) {
    super(...args);

    // Set the key to profile
    this.key = 'profile';
  }

  api(profileId) {
    const scope = {};
    if (!profileId) {
      return Promise.reject(new Error('You cannot load profile data without a profileId.'));
    }

    if (!this.env) {
      return Promise.reject(new Error('You cannot load profile data without an environment.'));
    }
    const url = `https://${this.env.prefix}common.rv-api.redventures.net/profile/${profileId}.json`;

    return client
    .get(url)
    .then((response) => {
      const apiResult = response.data;
      const profileResponse = apiResult.data;

      // build data for profile
      const profileData = {
        ...profileResponse,
        atomConfig: {},
        profileCompanies: []
      };

      // convert string to json object
      if (profileResponse.atomConfig && typeof profileResponse.atomConfig === 'string') {
        profileData.atomConfig = JSON.parse(profileResponse.atomConfig);
      }

      try {
        profileData.ropeConfig = JSON.parse(profileResponse.ropeConfig);
      } catch (e) {
        profileData.ropeConfig = {};
      }

      profileData.profileCompanies = Object.keys(profileResponse.profileCompanies).map((index) => {
        const profileCompany = profileResponse.profileCompanies[index];
        return {
          companyId: profileCompany.companyId,
          subCompanyId: profileCompany.subCompanyId,
        }
      });

      const companyUrl = `https://${this.env.prefix}common.rv-api.redventures.net/company/${profileResponse.primaryCompanyId}.json`;

      scope.profileData = profileData;

      return client
      .get(companyUrl);
    })
    .then((companyResult) => {
      const companyApiResult = companyResult.data;
      const companyResponse = companyApiResult.data;

      scope.profileData.primaryCompany = {
        companyId: companyResponse.companyId,
        shardId: companyResponse.shardId,
        shardName: companyResponse.shardName,
        companyName: companyResponse.companyName,
        databaseName: companyResponse.databaseName,
        companyPrefix: companyResponse.companyPrefix,
        queuePrefix: companyResponse.queuePrefix,
        serverPodId: companyResponse.serverPodId,
        serverPod: companyResponse.serverPod,
      };

      // Cache in redis and return the profile data
      return this.saveCache(profileId, scope.profileData);
    })
  }
};
