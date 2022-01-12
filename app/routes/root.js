const fastifyInstance = require('fastify')();
const example = require('./example');
const { reserve, get, update, all } = require('./reserve');
const { service } = require('./service');
const { sendSms } = require('./notify');
const dotenv = require('dotenv');
dotenv.config();

example(fastifyInstance);
reserve(fastifyInstance);
get(fastifyInstance);
all(fastifyInstance);
update(fastifyInstance);
service(fastifyInstance);
sendSms(fastifyInstance);

module.exports = fastifyInstance;
