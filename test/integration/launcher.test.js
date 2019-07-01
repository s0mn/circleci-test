import chai from 'chai';

chai.should();

import server from 'atom-serverless';
import { reactor } from '../../src/controllers';
import requestData from './objects/requestData';
import mockRequestData from './objects/mockRequestData';
import launcherResult from './objects/launcherResult';

describe('launcher', () => {
  // Refer to ./objects/redisTestData.json for setting up a redis key for testing
  it('should return valid data', (done) => {
    // Have to do this
    (async () => {
      server(
        reactor,
        { queryStringParameters: requestData },
        {},
        (err, result) => {
          // Using a setTimeout to escape the try/catch that surrounds
          // this callback from the "server" call
          setTimeout(() => {
            const data = JSON.parse(result.body);
            // console.log(JSON.stringify(data, null, 2));

            // launcherResult.agent.should.eql(data.agent);
            // launcherResult.call.should.eql(data.call);
            // launcherResult.profile.should.eql(data.profile);
            launcherResult.should.eql(data);

            done();
          });
        }
      );
    })()
  }).timeout(10000);

  it.skip('should return valid data from the mock endpoint', (done) => {
    // Have to do this
    (async () => {
      server(
        reactor,
        { queryStringParameters: mockRequestData },
        {},
        (err, result) => {
          // Using a setTimeout to escape the try/catch that surrounds
          // this callback from the "server" call
          setTimeout(() => {
            const data = JSON.parse(result.body);
            // console.log(JSON.stringify(data, null, 2));

            // launcherResult.agent.should.eql(data.agent);
            // launcherResult.call.should.eql(data.call);
            // launcherResult.profile.should.eql(data.profile);
            launcherResult.should.eql(data);

            done();
          });
        }
      );
    })()
  }).timeout(10000);
});
