const example = require('../../routes/example');
const fastify = require('fastify');

describe('example is loaded', () => {
  let fastifyInstance = null;
  beforeEach(async () => {
    fastifyInstance = fastify();
    fastifyInstance.sendLogMessage = jest.fn();
  });

  afterAll(() => {
    fastifyInstance.close();
  });

  it('GET returns 200', async () => {
    await example(fastifyInstance);
    const response = await fastifyInstance.inject({ method: 'GET', url: '/example' });
    expect(response.statusCode).toEqual(200);
    const payload = JSON.parse(response.payload);
    expect(payload).toMatchSnapshot({
      code: '178172127981',
      cognome: 'Example',
      nome: 'Hello',
    });
  });

  it('POST returns 404', async () => {
    await example(fastifyInstance);
    const response = await fastifyInstance.inject({ method: 'POST', url: '/' });
    expect(response.statusCode).toEqual(404);
    expect(response.payload).toMatchSnapshot();
  });
});
