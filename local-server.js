const express = require('express');
const app = express();
const port = 3033;
const launcher = require('./dist/index');

app.get('/launcher/reactor', (req, res) => {
  launcher.reactorLauncher(
    { queryStringParameters: req.query },
    {},
    (err, result) => {
      res.send(result.body)
    }
  );
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
