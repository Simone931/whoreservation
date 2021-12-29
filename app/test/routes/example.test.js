const example = require('../../routes/example');
const fastify = require('fastify');
const elkLogService = example.__get__('elkLogService');

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
    const spy = jest.spyOn(fastifyInstance, 'sendLogMessage');
    await example(fastifyInstance);
    const response = await fastifyInstance.inject({ method: 'GET', url: '/example' });
    expect(response.statusCode).toEqual(200);
    const payload = JSON.parse(response.payload);
    expect(spy).toHaveBeenCalledWith(elkLogService.elkLogLevel.INFO, 'Send the response');
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
