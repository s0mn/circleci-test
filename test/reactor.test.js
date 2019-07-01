import reactor from '../src/controllers/reactor';
import { Request, Response } from 'atom-serverless';

import chai from 'chai';

chai.should();

describe('Session Controller', function() {
  it('should create sessions', async function() {
    const req = new Request({
      headers: {},
      queryStringParameters: {
        environment: 'test',
        profileId: 2003,
        agentId: 37020,
        callId: '2001783476H0160111',
        pod: 'p08',
        decreeEnv: 'test',
        scenarioEnv: 'test',
        coreUrl: 'https://test.reactor-core.redventures.net&scenarioId=5026',
      }
    }, null, null);
    const res = new Response({}, null, (e, d) => {
      try {
        return d.body.should.include('launcher.launch');
      } catch(e) {
        throw e;
      }
    });

    // Launch a scenario
    reactor(req, res);
  })
});