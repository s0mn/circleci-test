import AWSXRay from 'aws-xray-sdk';
import { connect, Mock } from '../dal';
import { launcher } from "../launcher";
import * as logger from '../logger';

const fullUrl = (req) => (
  `${req.protocol}://${req.host}${req.originalUrl}`
);

export default async function (req, res) {
  let client = Mock();
  // Open an xray segment
  const segment = new AWSXRay.Segment('atom-simulate');

  try {
    // Open a connection
    try {
      client = await connect();
    } catch (e) {
      logger.error('dal', e.message, e);
    }

    let loaderData = await launcher({
      url: fullUrl(req),
      ...req.query,
    }, client, segment);

    segment.close();

    // Send up the response
    return res.status(200)
      .headers({ 'Content-Type': 'application/json' })
      .json(loaderData);
  } catch (e) {
    const error = e;
    logger.error('controller', e.message, e);
    segment.close();
    if (error && error['Atom/SharedAPI/7'] && error['Atom/SharedAPI/7'].ExceptionMessage) error.message = error['Atom/SharedAPI/7'].ExceptionMessage;
    return res.status(500)
      .headers({ 'Content-Type': 'application/json' })
      .json(error);
  }
};
