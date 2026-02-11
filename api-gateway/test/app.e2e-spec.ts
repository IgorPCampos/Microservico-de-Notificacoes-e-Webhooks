import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  RabbitMQContainer,
  StartedRabbitMQContainer,
} from '@testcontainers/rabbitmq';
import { AppModule } from '../src/app.module';
import { of } from 'rxjs';

jest.setTimeout(60000);

describe('API Gateway (E2E) com RabbitMQ Real', () => {
  let app: INestApplication;
  let container: StartedRabbitMQContainer;

  beforeAll(async () => {
    container = await new RabbitMQContainer(
      'rabbitmq:3-management-alpine',
    ).start();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('NOTIFICATION_SERVICE')
      .useValue({
        emit: jest.fn(() => of(true)),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/notifications (POST) - deve aceitar a requisição', () => {
    const payload = {
      email: 'e2e@gateway.com',
      title: 'Teste E2E',
      content: 'Funcionou via Supertest!',
    };

    return request(app.getHttpServer())
      .post('/notifications')
      .send(payload)
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
    await container.stop();
  });
});
