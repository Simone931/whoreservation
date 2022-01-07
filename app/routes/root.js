const fastifyInstance = require('fastify')();
const example = require('./example');
const { reserve, get } = require('./reserve');
const { service } = require('./service');
const dotenv = require('dotenv');
dotenv.config();

example(fastifyInstance);
reserve(fastifyInstance);
get(fastifyInstance);
service(fastifyInstance);

module.exports = fastifyInstance;
