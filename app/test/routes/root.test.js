const root = require('../../routes/root');
const fastifyInstance = root.__get__('fastifyInstance');
const manageOpLogsForAllRequests = root.__get__('manageOpLogsForAllRequests');
const elkLogService = require('../../plugins/elk-log-service');

describe('root tests', () => {
  beforeEach(async () => {
    fastifyInstance.sendLogToElk = jest.fn(() => Promise.resolve());
  });

  afterAll(() => {
    fastifyInstance.close();
  });

  it('should send operational log with status code 200', async () => {
    const spy = jest.spyOn(fastifyInstance, 'sendLogToElk');
    const request = {
      method: 'GET',
      url: '/example',
    };
    const payload = {
      nome: 'Hello',
      cognome: 'Example',
      code: '178172127981',
    };
    await manageOpLogsForAllRequests(request, 200, payload);
    expect(spy).toHaveBeenCalledWith(request, payload, elkLogService.elkLogLevel.INFO);
  });

  it('should send operational log with status code 400', async () => {
    const spy = jest.spyOn(fastifyInstance, 'sendLogToElk');
    const request = {
      method: 'GET',
      url: '/example',
    };
    const payload = {
      nome: 'Hello',
      cognome: 'Example',
      code: '178172127981',
    };
    await manageOpLogsForAllRequests(request, 400, payload);
    expect(spy).toHaveBeenCalledWith(request, payload, elkLogService.elkLogLevel.ERROR);
  });
});
