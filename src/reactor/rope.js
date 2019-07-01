import Cache from './cache';
import ropeClient from 'rope-client';
import { isEmpty, get } from 'lodash';

const ROPE_TRACKING_TYPES = {
  INBOUND_CALL: 7,
  OUTBOUND_CALL: 8,
  HAILO_INTERACTION: 9,
};
/**
 * Builds a ROPE session model from a subset of the loader data
 *
 * @param {object} data
 * @return {object}
 */
function buildRopeSession(data = {}) {
  const session = {
    applicationProfileId: get(data, 'profile.ropeConfig.applicationProfileId', ''),
    callId: get(data, 'call.callId', ''),
    trackingId: data.trackingId || get(data, 'call.callId', ''),
    trackingTypeId: get(data, 'trackingTypeId', '') || 7, // Pull trackingType from data or use default of 7
    marketingCodeId: get(data, 'marketing.marketingCodeId', ''),
    marketingProgramId: get(data, 'marketing.marketingProgramId', ''),
    agentId: get(data, 'agent.agentId', ''),
  };

  const ropeId = get(data, 'initialParams.ropeId', null);
  if (ropeId && get(data, 'initialParams.mockCall', null)) {
    session.playbackRopeId = ropeId;
  }

  // If not passed a trackingId default to using the call info
  if (isEmpty(session.trackingId) && !isEmpty(session.callId)) {
    const callDirection = get(data, 'call.callDirection');
    if (callDirection === 'Outbound') {
      session.trackingTypeId = ROPE_TRACKING_TYPES.OUTBOUND_CALL;
    } else {
      session.trackingTypeId = ROPE_TRACKING_TYPES.INBOUND_CALL;
    }
    session.trackingId = session.callId;
  }

  return session;
}

export default class Rope extends Cache {
  constructor(...args) {
    super(...args);

    // Set the key to profile
    this.key = 'rope';
  }

  get(id, data) {
    // Override super to make the api and not use cache
    return this.api(id, data);
  }

  api(id, data) {
    const { rope } = data;
    const ropeId = rope.ropeId;

    // If we have a rope ID and not a mock call then resolve the rope data
    const mockCall = get(data, 'initialParams.mockCall', null);
    if (ropeId && !mockCall) return Promise.resolve(data.rope);

    const client = new ropeClient.Client({
      adapter: new ropeClient.Adapters.Http({
        env: data.environment.environment,
      }),
    });

    const session = buildRopeSession(data);
    return new Promise((resolve, reject) => {
      client.createSession(session, (err, response) => {
        if (err) {
          return reject(err);
        }

        this.saveCache(data.call.callId, response)
        .then((r) => {
          return resolve(r);
        });
      });
    });
  }
};
