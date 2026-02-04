import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);

  const rmqUrl = configService.getOrThrow<string>('RABBITMQ_URL');
  const queueName = configService.getOrThrow<string>('RABBITMQ_QUEUE');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue: queueName,
        queueOptions: {
          durable: false,
        },
      },
    },
  );

  await appContext.close();

  await app.listen();
  console.log(`Microservice ouvindo na fila: ${queueName}`);
}
bootstrap();
