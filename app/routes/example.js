const schema = require('../schemas/example-endpoint.schema');

const example = (fastifyInstance) => {
  fastifyInstance.get('/example', schema, async (request, reply) => {
    const response = {
      nome: 'Hello',
      cognome: 'Example',
      code: '178172127981',
    };
    reply.header('Content-Type', 'application/json').code(200);
    reply.send(response);
  });
};

module.exports = example;
