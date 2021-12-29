const fastifyInstance = require('fastify')();
const example = require('./example');
const dotenv = require('dotenv');
dotenv.config();

example(fastifyInstance);

module.exports = fastifyInstance;
