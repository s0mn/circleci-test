import AWSXRay from 'aws-xray-sdk';
import monitor from '../monitoring';
import ejs from 'ejs';
import { connect, Mock } from '../dal';
import { launcher } from "../launcher";
import decree from '../reactor/decree';
import Launcher from '../reactor/launcher';
import ActivePublish from '../reactor/activePublish';
import errorTemplate from "../view/error";
import * as logger from '../logger';
import darkly from '../../atom-ld';

const fullUrl = (req) => (
  `${req.protocol}://${req.host}${req.originalUrl}`
);

export default async function (req, res) {
  let lDarkly = new darkly();

  // Start LaunchDarkly configuring
  lDarkly.configure();

  let client = Mock();
  // Open an xray segment
  const segment = new AWSXRay.Segment('atom-launcher');

  try {
    let loaderData = await launcher({
      url: fullUrl(req),
      ...req.query,
    }, client, segment, lDarkly);

    loaderData = await monitor('decree', segment, async () => {
      return decree(loaderData, client);
    });

    const activePublish = new ActivePublish(loaderData.environment, client);

    let result = await monitor('active publish', segment, async () => {
      return activePublish.get(req.query, loaderData);
    });

    // If the last publish is web then delete their rope session so atom
    // ui generates it on the front end
    if (result.medium === 'web') {
      delete loaderData.rope;
    }

    if (!result || !result.htmlUrl) {
      throw new Error(`No html URL for ${result.scenarioId}`);
    }

    // put tagId from getActivePublish onto loaderData.scenario for front end metric tracking
    if (loaderData.scenario) {
      loaderData.scenario = {
        ...loaderData.scenario,
        tagId: result.tagId,
      };
    }

    // Lookup the html from dal
    const lan = new Launcher(loaderData.environment, client);
    let html = await monitor('html', segment, async () => {
      return lan.get({
        url: result.htmlUrl,
        publishId: result.publishId,
      });
    });

    // Place the loader data into window.loaderData by replacement
    const encodedData = JSON.stringify(loaderData);

    if (req.query.dataOnly) {
      return res.status(200)
        .headers({ 'Content-Type': 'application/json' })
        .send(encodedData);
    }

    // Send up the response
    segment.close();
    return res.status(200)
      .headers({ 'Content-Type': 'text/html' })
      .send(html
        .replace('<atomLoaderData />', `<script>window.loaderData = ${encodedData};</script>`)
      );
  } catch (e) {
    const error = e;
    // console.log(e.stack);
    logger.error('controller', e.message, e);
    segment.close();
    if (error && error['Atom/SharedAPI/7'] && error['Atom/SharedAPI/7'].ExceptionMessage) error.message = error['Atom/SharedAPI/7'].ExceptionMessage;
    return res.status(500)
      .headers({ 'Content-Type': 'text/html' })
      .render(d => ejs.render(errorTemplate, d), {
        error,
        url: req.url,
      });
  }
};
