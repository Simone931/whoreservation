const awsLambdaFastify = require('aws-lambda-fastify');
const fastifyInstance = require('./routes/root');
const proxy = awsLambdaFastify(fastifyInstance);
exports.handler = async (event, context) => {
  process.env.requestId = context.awsRequestId;
  return proxy(event, context);
};
