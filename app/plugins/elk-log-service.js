const { SQS } = require('aws-sdk');
const fp = require('fastify-plugin');
const fastRedact = require('fast-redact');
const fastify = require('fastify')({
  logger: true,
});
const sensibleDataPaths = require('../schemas/sensibleData');

const logLevel = {
  INFO: 'info',
  ERROR: 'error',
};

const redact = fastRedact({
  paths: sensibleDataPaths.paths,
  censor: '***GDPR***',
  serialize: false,
});

const getRedactedResponse = (response) => {
  if (response instanceof Array || response instanceof Object) {
    return redact(response);
  }
  return response;
};

const send = async (params) => {
  try {
    const sqs = new SQS({ apiVersion: '2012-11-05' });
    await sqs.sendMessage(params).promise();
    fastify.log.info('Log sent');
  } catch (err) {
    fastify.log.error(
      `Error during the sending of the operational log: ${err} and params: ${JSON.stringify({
        MessageBody: JSON.parse(params.MessageBody),
        QueueUrl: params.QueueUrl,
      })}`,
    );
  }
};

const getSerializedRequest = (request) => {
  if (!request) {
    return null;
  }
  let req = null;
  try {
    req = ['body', 'params', 'query'].reduce((result, key) => {
      if (key in request) {
        result[key] = request[key];
      }
      return result;
    }, {});
  } catch (err) {
    fastify.log.error(
      `Error during the parsing of the request body, params and query: ${err} and request: ${JSON.stringify(
        request,
      )}`,
    );
  }
  return req;
};

const getUrl = (request) => {
  return request && request.url ? request.url : '';
};

const getParamsObject = (serializedRequest, request, response, message, host, logLevel) => {
  fastify.log.info('reqId: ' + process.env.requestId);
  const output = response ? JSON.parse(response) : {};
  const dateNow = new Date();
  const yearMonthDay = `${dateNow.getFullYear()}.${dateNow.getMonth() + 1}.${dateNow.getDate()}`;
  return {
    MessageBody: JSON.stringify({
      reqId: process.env.requestId,
      source: `Marmellata-${yearMonthDay}`,
      component: 'Marmellata',
      eventTime: new Date().toISOString(),
      eventSource: `${host || ''}${getUrl(request)}`,
      level: logLevel,
      in: getRedactedResponse(serializedRequest) || {},
      out: getRedactedResponse(output),
      message: getRedactedResponse(message) || '',
    }),
    QueueUrl:
      process.env.APP_ENV === 'stage'
        ? process.env.STAGE_LOGS_QUEUE_URL
        : process.env.PROD_LOGS_QUEUE_URL,
  };
};

const sendLogToElk = (request, response, logLevel, message) => {
  const serializedReq = getSerializedRequest(request);
  const host =
    request && 'headers' in request && 'host' in request.headers ? request.headers.host : '';
  const params = getParamsObject(serializedReq, request, response, message, host, logLevel);
  if (process.env.APP_ENV === 'local') {
    fastify.log.info(params.MessageBody);
    return;
  }
  return send(params);
};

const sendLogMessage = (logLevel, message) => {
  return sendLogToElk(null, null, logLevel, message);
};

const elkLogService = (fastify, opts, done) => {
  fastify.decorate('sendLogToElk', sendLogToElk);
  fastify.decorate('sendLogMessage', sendLogMessage);
  done();
};

module.exports = {
  elkLogPlugin: fp(elkLogService),
  elkLogLevel: logLevel,
};
