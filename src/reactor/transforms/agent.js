import { numbersToStrings, mapProperties, deleteProperties } from "./util";
import { cloneDeep } from 'lodash';

export default function transformAgent(agentInformation) {
  const agent = cloneDeep(agentInformation.agentSession);

  mapProperties(agent, {
    'agentSupervisorId': 'supervisorId',
    'old_Username': 'oldUsername',
    'old_AgentId': 'oldAgentId',
    'ipos_Flag': 'iPOSFlag',
    'homePc': 'homePC',
    'directvAgentId': 'dIRECTVAgentId',
    'dobDay': 'dOBDay',
    'dobMonth': 'dOBMonth',
  });

  deleteProperties(agent, [
    '_self',
    'companies',
    'employee',
    'profile',
    'supervisor',
    'old_Username',
    'old_AgentId',
    'ipos_Flag',
    'profileId',
    'reactorBeta',
    'homePc',
    'isCorporate',
    'directvAgentId',
    'dobMonth',
    'dobDay',
    'token',
  ]);

  agent.___type = 'Atom\\SharedAPI\\Model\\Agent';
  agent.hireDate = agent.hireDate.split('T')[0];
  agent.firstCallDate = agent.firstCallDate.split('T')[0];

  // Just grab the flagIds
  const flagsArray = [];
  for (const i in agent.flags) {
    const flag = agent.flags[i];

    if (flag.active === 'y') {
      flagsArray.push(flag.flagId);
    }
  }
  agent.flags = flagsArray;

  return agent;
}
