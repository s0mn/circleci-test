import AgentInformation from "./reactor/agentInformation";
import monitor from './monitoring';
import transformAgent from './reactor/transforms/agent';
import transformCall from './reactor/transforms/call';
import transformProfile from './reactor/transforms/profile';

export default async function getReactorData(response, data, client, segment) {
  const agentInformation = new AgentInformation(response.environment, client);

  const result = await monitor('reactor: profile agent call', segment, async () => {
    return agentInformation.get(data.agentUsername, data);
  });

  response.agent = transformAgent(result);
  response.call = transformCall(result);
  response.profile = transformProfile(result);

  response.callsCompanies = response.call.callsCompanies;
}
