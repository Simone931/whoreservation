const elkLogService = require('../../plugins/elk-log-service');
const getParamsObject = elkLogService.__get__('getParamsObject');
const getSerializedRequest = elkLogService.__get__('getSerializedRequest');
const sendLogToElk = elkLogService.__get__('sendLogToElk');
const fastifyLog = elkLogService.__get__('fastify');
const requestId = elkLogService.__get__('requestId');
const { SQS } = require('aws-sdk');
const send = elkLogService.__get__('send');
const sendLogMessage = elkLogService.__get__('sendLogMessage');

jest.mock('aws-sdk', () => {
  const SQSMocked = {
    sendMessage: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };
  return {
    SQS: jest.fn(() => SQSMocked),
  };
});

describe('elk log service', () => {
  fastifyLog.log = {
    info: jest.fn(),
    error: jest.fn(),
  };
  process.env = {
    ...process.env,
    APP_ENV: 'local',
    STAGE_LOGS_QUEUE_URL: 'queue-url',
  };

  const mockDate = new Date('2020-11-01T00:00:00.000Z');
  jest.spyOn(global, 'Date').mockImplementation(() => {
    return mockDate;
  });
  const dateNow = new Date();
  const yearMonthDay = `${dateNow.getFullYear()}.${dateNow.getMonth() + 1}.${dateNow.getDate()}`;

  afterAll(() => {
    delete process.env.APP_ENV;
    delete process.env.STAGE_LOGS_QUEUE_URL;
  });

  it('should get the params object to send', () => {
    const request = {
      headers: {
        host: 'https://my.host',
      },
      body: {
        test: 'test',
      },
      params: {},
      query: {},
      url: '/url',
    };
    const response = JSON.stringify({ hello: 'world' });
    const serializedRequest = {
      body: {
        test: 'test',
      },
      params: {},
    };
    const res = getParamsObject(
      serializedRequest,
      request,
      response,
      '',
      request.headers.host,
      elkLogService.elkLogLevel.INFO,
    );
    const messageBody = JSON.parse(res.MessageBody);
    expect(messageBody.source).toEqual(`Marmellata-${yearMonthDay}`);
    expect(messageBody.eventSource).toEqual(request.headers.host + request.url);
    expect(messageBody.level).toEqual(elkLogService.elkLogLevel.INFO);
    expect(messageBody.in).toEqual(serializedRequest);
    expect(messageBody.out).toEqual({
      hello: 'world',
    });
  });

  it('should get the params object to send with empty string for event source', () => {
    const serializedRequest = {
      body: {
        test: 'test',
      },
      params: {},
    };
    const request = {
      headers: {
        host: null,
      },
      body: {
        test: 'test',
      },
      params: {},
      query: {},
      url: null,
    };
    const response = JSON.stringify({ hello: 'world' });
    const res = getParamsObject(
      serializedRequest,
      request,
      response,
      '',
      null,
      elkLogService.elkLogLevel.INFO,
    );
    const messageBody = JSON.parse(res.MessageBody);
    expect(messageBody.source).toEqual(`Marmellata-${yearMonthDay}`);
    expect(messageBody.eventSource).toEqual('');
    expect(messageBody.level).toEqual(elkLogService.elkLogLevel.INFO);
    expect(messageBody.in).toEqual(serializedRequest);
    expect(messageBody.out).toEqual({
      hello: 'world',
    });
  });

  it('should get params object with serializedRequest equal to null', () => {
    const request = {
      headers: {
        host: null,
      },
      body: {
        test: 'test',
      },
      params: {},
      query: {},
      url: null,
    };
    const response = JSON.stringify({ hello: 'world' });
    const res = getParamsObject(null, request, response, '', null, elkLogService.elkLogLevel.INFO);
    const messageBody = JSON.parse(res.MessageBody);
    expect(messageBody.source).toEqual(`Marmellata-${yearMonthDay}`);
    expect(messageBody.eventSource).toEqual('');
    expect(messageBody.level).toEqual(elkLogService.elkLogLevel.INFO);
    expect(messageBody.in).toEqual({});
    expect(messageBody.out).toEqual({
      hello: 'world',
    });
  });

  it('should get the serialized request', () => {
    const request = {
      headers: {
        host: 'https://my.host',
      },
      body: {
        test: 'test',
      },
      params: {},
      query: {},
      url: '/url',
    };
    const res = getSerializedRequest(request);
    expect(res).toEqual({
      body: {
        test: 'test',
      },
      params: {},
      query: {},
    });
  });

  // eslint-disable-next-line quotes
  it("shouldn't get the serialized request", () => {
    const request = null;
    const res = getSerializedRequest(request);
    expect(res).toEqual(null);
  });

  it('should send log', () => {
    const logSpy = jest.spyOn(fastifyLog.log, 'info');
    const request = {
      headers: {
        host: 'https://my.host',
      },
      body: {
        test: 'test',
      },
      params: {},
      query: {},
      url: '/url',
    };
    sendLogToElk(request, JSON.stringify({ hello: 'world' }), elkLogService.elkLogLevel.INFO);
    expect(logSpy).toHaveBeenCalledWith(
      JSON.stringify({
        reqId: requestId,
        source: `Marmellata-${yearMonthDay}`,
        component: 'Marmellata',
        eventTime: dateNow.toISOString(),
        eventSource: 'https://my.host/url',
        level: 'info',
        in: { body: request.body, params: {}, query: {} },
        out: { hello: 'world' },
        message: '',
      }),
    );
  });

  it('should send message', () => {
    const logSpy = jest.spyOn(fastifyLog.log, 'info');
    sendLogMessage(elkLogService.elkLogLevel.INFO, 'Send new business logic message');
    expect(logSpy).toHaveBeenCalledWith(
      JSON.stringify({
        reqId: requestId,
        source: `Marmellata-${yearMonthDay}`,
        component: 'Marmellata',
        eventTime: dateNow.toISOString(),
        eventSource: '',
        level: 'info',
        in: {},
        out: {},
        message: 'Send new business logic message',
      }),
    );
  });

  it('should send log to the queue', async () => {
    process.env = {
      ...process.env,
      APP_ENV: 'stage',
    };
    const request = {
      headers: {
        host: 'https://my.host',
      },
      body: {
        test: 'test',
      },
      params: {},
      query: {},
      url: '/url',
    };
    const response = JSON.stringify({ hello: 'world' });
    const serializedRequest = {
      body: {
        test: 'test',
      },
      params: {},
    };
    const res = getParamsObject(
      serializedRequest,
      request,
      response,
      '',
      request.headers.host,
      elkLogService.elkLogLevel.INFO,
    );
    const sqs = new SQS({
      region: 'eu-west-1',
    });
    const logSpy = jest.spyOn(fastifyLog.log, 'info');
    sqs.sendMessage().promise.mockResolvedValueOnce();
    await send(res);
    expect(logSpy).toHaveBeenCalledWith('Log sent');
  });

  it('should not send log to the queue', async () => {
    process.env = {
      ...process.env,
      APP_ENV: 'stage',
    };
    const request = {
      headers: {
        host: 'https://my.host',
      },
      body: {
        test: 'test',
      },
      params: {},
      query: {},
      url: '/url',
    };
    const response = JSON.stringify({ hello: 'world' });
    const serializedRequest = {
      body: {
        test: 'test',
      },
      params: {},
    };
    const res = getParamsObject(
      serializedRequest,
      request,
      response,
      '',
      request.headers.host,
      elkLogService.elkLogLevel.INFO,
    );
    const sqs = new SQS({
      region: 'eu-west-1',
    });
    const logSpy = jest.spyOn(fastifyLog.log, 'error');
    sqs.sendMessage().promise.mockRejectedValueOnce(new Error('some send message error'));
    await send(res);
    expect(logSpy).toHaveBeenCalledWith(
      `Error during the sending of the operational log: Error: some send message error and params: ${JSON.stringify(
        {
          MessageBody: JSON.parse(res.MessageBody),
          QueueUrl: res.QueueUrl,
        },
      )}`,
    );
  });
});
