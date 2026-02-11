import { Test, TestingModule } from '@nestjs/testing';
import {
  RabbitMQContainer,
  StartedRabbitMQContainer,
} from '@testcontainers/rabbitmq';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { INestMicroservice } from '@nestjs/common';
import { NotificationController } from '../notification/transport/controllers/notification.controller';
import { EMAIL_SENDER_PORT } from '../notification/domain/ports/email-sender.port';
import { USER_VALIDATOR_PORT } from '../notification/domain/ports/user-validator.port';

jest.setTimeout(30000);

describe('Notification Service - RabbitMQ Integration', () => {
  let container: StartedRabbitMQContainer;
  let app: INestMicroservice;
  let clientProxy: ClientProxy;

  const mockEmailService = { send: jest.fn().mockResolvedValue(true) };
  const mockUserService = {
    validate: jest
      .fn()
      .mockResolvedValue({ isValid: true, name: 'Integration Test User' }),
  };

  beforeAll(async () => {
    container = await new RabbitMQContainer('rabbitmq:3.12-management-alpine')
      .withExposedPorts(5672)
      .start();
  });

  beforeEach(async () => {
    const amqpUrl = `amqp://guest:guest@${container.getHost()}:${container.getMappedPort(5672)}`;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      imports: [
        ClientsModule.register([
          {
            name: 'TEST_CLIENT',
            transport: Transport.RMQ,
            options: {
              urls: [amqpUrl],
              queue: 'notification_queue',
              queueOptions: { durable: true },
            },
          },
        ]),
      ],
      providers: [
        { provide: EMAIL_SENDER_PORT, useValue: mockEmailService },
        { provide: USER_VALIDATOR_PORT, useValue: mockUserService },
      ],
    }).compile();

    app = module.createNestMicroservice({
      transport: Transport.RMQ,
      options: {
        urls: [amqpUrl],
        queue: 'notification_queue',
        queueOptions: { durable: true },
      },
    });

    await app.listen();

    clientProxy = module.get<ClientProxy>('TEST_CLIENT');
    await clientProxy.connect();
  });

  it('deve consumir uma mensagem da fila e chamar os serviços', async () => {
    mockEmailService.send.mockClear();
    mockUserService.validate.mockClear();

    const payload = {
      to: 'integration@test.com',
      subject: 'Teste RabbitMQ',
      body: 'Hello World',
    };

    clientProxy.emit('send_email', payload);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(mockUserService.validate).toHaveBeenCalledWith(
      'integration@test.com',
    );
    expect(mockEmailService.send).toHaveBeenCalled();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (container) await container.stop();
  });
});
