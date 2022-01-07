// var AWS = require('aws-sdk');

// AWS.config.update({
//   accessKeyId: 'YOUR-ACCESSKEYID',
//   secretAccessKey: 'YOUR-SECRETACCESSKEY',
//   region: 'localhost',
//   endpoint: 'http://ddb_marmellata:8001',
// });

// const ddb = {
//   dbClient: new AWS.DynamoDB(),
// };

// module.exports = ddb;

var dynamodb = require('serverless-dynamodb-client');

var rawClient = dynamodb.raw; // returns an instance of new AWS.DynamoDB()

var docClient = dynamodb.doc; // return an instance of new AWS.DynamoDB.DocumentClient()

const ddb = { rawClient, docClient };

module.exports = ddb;
