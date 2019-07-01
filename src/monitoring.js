import AWSXRay from 'aws-xray-sdk';
import * as logger from './logger';

export default async function (name, segment, fn) {
  return new Promise((resolve, reject) => {
    try {
      const ns = AWSXRay.getNamespace();

      ns.run(async function () {
        AWSXRay.setSegment(segment);
          AWSXRay.captureAsyncFunc(name, async function(subsegment) {
            try {
              let res = await fn();
              subsegment.close();
              return resolve(res);
            } catch(e) {
              logger.error('monitoring', e)
              subsegment.close(e);
              return reject(e);
            }
          });
      });
    } catch (e) {
      logger.error('monitoring', e);
      return reject(e);
    }
  });
}