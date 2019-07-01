import { connect, Mock } from '../dal';
import * as logger from '../logger';
import ActivePublish from '../reactor/activePublish';

export default async function (req, res) {
  let client = Mock();
  try {
    // Open a dynamo connection
    try {
      client = await connect();
    } catch(e) {
      logger.error('dynamo', e.message, e);
    }

    // Create a new active publish that we get hit for the HTML url
    const activePublish = new ActivePublish(process.env.NODE_ENV || 'test', client);
    let result = await activePublish.get(req.query, {});

    if (!result || !result.htmlUrl) {
      throw new Error(`No html URL for ${result.scenarioId}`);
    }

    // Disconnect redis
    client.disconnect();

    // Send up the response
    return res.status(200).json({
      url: result.htmlUrl.replace('https://cdn.convergion.net/scenario/', ''),
    });
  } catch(e) {
    logger.error('activepublish', e.message, e);

    // Disconnect redis
    client.disconnect();


    return res.status(500)
      .json({ message: e.message })
  }
};
