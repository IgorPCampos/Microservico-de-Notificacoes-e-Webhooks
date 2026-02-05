import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL as string],
        queue: process.env.RABBITMQ_QUEUE,
        queueOptions: {
          durable: false,
        },
      },
    },
  );

  await app.listen();
  logger.log(`🚀 Microservice ouvindo na fila: ${process.env.RABBITMQ_QUEUE}`);
}
bootstrap();
