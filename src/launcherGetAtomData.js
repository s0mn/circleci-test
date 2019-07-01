import Profile from "./reactor/profile";
import Agent from "./reactor/agent";
import Call from "./reactor/call";
import monitor from './monitoring';

/**
 * Get the profile, agent, and call data for this session
 * and populate it on the response object
 * 
 * @param {*} response 
 * @param {*} data 
 * @param {*} client 
 * @param {*} segment 
 */
export default async function getAtomData(response, data, client, segment) {
  const profile = new Profile(response.environment, client);
  const agent = new Agent(response.environment, client);
  const call = new Call(response.environment, client);

  response.profile = await monitor('profile', segment, async () => {
    return profile.get(data.profileId);
  });

  let [agentData, callData] = await monitor('agent call', segment, async () => {
    return Promise.all([
      agent.get(data.agentUsername || data.agentId, {
        agentUsername: data.agentUsername,
        agentId: data.agentId,
        coreUrl: data.coreUrl,
      }),
      call.get(response.call.callId, response),
    ]);
  });

  // Add all the respective data to the response
  response.agent = {
    ...agentData,
    ...response.agent,
  };
  Object.assign(response, callData);
}
