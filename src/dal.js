import AWS from "aws-sdk";
import AmazonDaxClient from 'amazon-dax-client';

const region = 'us-east-1';
AWS.config.update({
  region,
});

class DataLayer {
  constructor(table, endpoints) {
    this.table = table;

    this.client = new AWS.DynamoDB.DocumentClient();
    this.dax = new AmazonDaxClient({ endpoints, region });
    this.daxClient = new AWS.DynamoDB.DocumentClient({ service: this.dax });
  }

  async get(key, cb) {
    try {
      // Gets can use DAX for super fast lookups
      const { Item } = await this.daxClient.get({
        TableName: this.table,
        Key: { cacheKey: key },
        ConsistentRead: true,
      }).promise();

      return cb(null, Item.data);
    } catch(e) {
      return cb(null, null);
    }
  }

  async set(key, data, other, exp, cb) {
    try {
      let secondsSinceEpoch = Math.round(Date.now() / 1000);
      let Item = {
        cacheKey: key,
        TimeToLive: secondsSinceEpoch + exp,
        data: JSON.stringify(data),
      };
      await this.client.put({
        TableName: this.table,
        Item,
      }).promise();

      return cb(null, Item);
    } catch(e) {
      return cb(e);
    }
  }

  async delete(key) {
    const params = {
      TableName: this.table,
      Key: { cacheKey: key },
    };

    try {
      await this.client.delete(params).promise();
      return Promise.resolve(true);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  disconnect() {
    return Promise.resolve();
  }
}


const init = function() {
  return new Promise(async (resolve, reject) => {
    // Just return a new dynamodb client
    try {
      return resolve(new DataLayer(process.env.DYNAMO_TABLE || `atom-launcher-cache-${process.env.NODE_ENV}`, process.env.DAX_HOST));
    } catch(e) {
      return reject(e);
    }
  });
};

export const connect = init;
export function Mock() {
  return {
    get(key, cb) {
      return cb(null, false);
    },
    set(key, data, other, exp, cb) {
      return cb(null);
    },
    disconnect() {
      return Promise.resolve();
    }
  }
}