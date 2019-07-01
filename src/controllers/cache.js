import { connect, Mock } from '../dal';
import * as logger from '../logger';

export default async function (req, res) {
  let client = Mock();
  try {
    // Open a connection
    try {
      client = await connect();
    } catch(e) {
      logger.error('dal', e.message);
    }

    // Delete whatever key was passed
    await client.delete(`atom:${process.env.NODE_ENV}:${req.query.key}`);
    return res.json({ message: 'success' })
  } catch(e) {
    const error = e;
    logger.error('cacheController', e.message, e);

    return res.status(500)
      .json({ message: error });
  }
};
