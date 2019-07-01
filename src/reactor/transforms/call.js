import { numbersToStrings, mapProperties, deleteProperties } from "./util";
import { cloneDeep } from 'lodash';

export default function transformCall(agentInformation, response) {
  const call = cloneDeep(agentInformation.interactions.customer.calldata);

  // Convert all properties that are numbers into strings
  numbersToStrings(call);

  deleteProperties(call, [
    'callPrivacyEnabled',
    'callerId_number'
  ]);

  for (const i in call.callsCompanies) {
    numbersToStrings(call.callsCompanies[i])
  }

  return call;
}
