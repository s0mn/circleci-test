import Rope from './reactor/rope';
import Marketing from './reactor/marketing';
import Contact from './reactor/contact';
import ProfileRules from './reactor/profileRules';
import Serviceability from './reactor/serviceability';
import monitor from './monitoring';

/**
 * Get the marketing, profileRules, rope contact, and service data for this session
 * and populate it on the response object 
 * 
 * @param {*} response 
 * @param {*} data 
 * @param {*} client 
 * @param {*} segment 
 */
export default async function getOtherData(response, data, client, segment) {
  const profileRules = new ProfileRules(response.environment, client);
  const marketing = new Marketing(response.environment, client);
  const rope = new Rope(response.environment, client);
  const contact = new Contact(response.environment, client);
  const service = new Serviceability(response.environment, client);

  let [marketingData, profileRulesData, ropeData, contactData, serviceableData] = await monitor('marketing profileRules session contact serviceability', segment, async () => {
    return Promise.all([
      marketing.get(response.initialParams.marketingCodeId || response.call.marketingCodeId, response),
      profileRules.get(data.profileId),
      rope.get(response.id, response),
      contact.get(data.contactId, response),
      service.get(data.serviceableId, response),
    ]);
  });

  response.profileRules = profileRulesData;
  response.marketing = marketingData;
  response.rope = ropeData;
  response.contact = contactData;
  response.serviceable = serviceableData;
}
