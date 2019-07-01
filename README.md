# Running Locally

In order to run this locally you will need to globally install these dependencies

```
npm install -g atom-lambda-deployer
npm install -g parcel-bundler
```

`atom-lambda-deployer` includes `lambo`

`lambo` requires `parcel` to successfully run

A local express server can be run using `npm run example:server` which will expose the controllers as endpoints

Currently yhe only available endpoint/controller is `launcher`

# TODO

Replace atom-serverless with serverless-express
