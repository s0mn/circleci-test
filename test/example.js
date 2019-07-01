const q = require('querystring');
const params = q.parse('agentUsername=clt.fatimah.smith&environment=test&profileId=2025&agentId=25795&callId=2001783476H0164sad&pod=p08&decreeEnv=test&scenarioEnv=test&coreUrl=https://dev.reactor-core.redventures.net&scenarioId=5691');

const launcher = require('../dist/index');
launcher.reactorLauncher({ queryStringParameters: params }, {}, (err, cb) => { console.log(cb.body) })
launcher.simulateLauncher({ queryStringParameters: params }, {}, (err, cb) => { console.log(cb.body) })

// const q = require('querystring');
// const params = q.parse('scenarioId=5077');
// const launcher = require('../dist/index');
// launcher.getActivePublish({ queryStringParameters: params }, {}, (err, cb) => { console.log(err, cb.body) })

// const q = require('querystring');
// const params = q.parse('key=atom:test:rope:2001783476H0160111');
// const launcher = require('../dist/index');
// launcher.deleteCache({ queryStringParameters: params }, {}, (err, cb) => { console.log(err, cb.body) })
