import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NotificationModule } from './notification/notification.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(NotificationModule);

  const configService = app.get(ConfigService);

  const rabbitUrl = configService.get<string>('RABBITMQ_URL');
  const queueName = configService.get<string>('RABBITMQ_QUEUE');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl as string],
      queue: queueName,
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3002);
}
bootstrap();
