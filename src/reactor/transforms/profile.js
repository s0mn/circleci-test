import { numbersToStrings, mapProperties, deleteProperties } from "./util";
import { cloneDeep } from 'lodash';

export default function transformProfile(agentInformation) {
  const profile = cloneDeep(agentInformation.agentProfile);

  for (const companyId in agentInformation.agentSession.companies) {
    const company = agentInformation.agentSession.companies[companyId];

    if (company.companyId == profile.primaryCompanyId) {
      profile.primaryCompany = company;
      break;
    }
  }

  numbersToStrings(profile);
  numbersToStrings(profile.primaryCompany);

  profile.atomConfig = profile.atomConfig && JSON.parse(profile.atomConfig);
  profile.ropeConfig = profile.ropeConfig && JSON.parse(profile.ropeConfig);
  // profile.reactorConfig = profile.reactorConfig && JSON.parse(profile.reactorConfig);

  deleteProperties(profile, [
    'abbreviation',
  ]);

  deleteProperties(profile.primaryCompany, [
    'active',
    'alertAgentAboutUncalledManual',
    'allowManualCallbacks',
    'allowManualPriorities',
    'allowMultipleManualCallbacks',
    'businessUrl',
    'callCenterLocationId',
    'companyAddress',
    'companyAddress2',
    'companyCity',
    'companyGroupId',
    'companyState',
    'companyZip',
    'constName',
    'contactClass',
    'customLogTitle',
    'inboundUnknownMarketingCodeId',
    'intranetLogoImage',
    'intranetLogoSort',
    'limitAgentManualCallbacks',
    'liveUrl',
    'logoImage',
    'manualCallbacksStartTime',
    'maxNumberOfManualsPerPhone',
    'metaDataTable',
    'orderTable',
    'orderTableIdCol',
    'outboundManualCallerIdMarketingCodeId',
    'outboundUnknownMarketingCodeId',
    'phoneSystemAgentContainer',
    'redErrorSystemId',
    'redMonsterEnabled',
    'scripterDirectory',
    'sendStudioUsername',
    'sendTopSalesDaysEmail',
    'siteId',
    'skillLevel',
    'statsImage',
    'styleSectionbar',
    'styleSectionbg',
    'styleTitleBar',
    'tenantId',
    'testUrl',
    'uniqueContactFields',
    'workforcePhone',
  ]);

  return profile
}
