import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { User } from './user.entity';

async function bootstrap() {
  const port = process.env.GRPC_USER_PORT;

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: join(__dirname, 'domain/proto/user-service.proto'),
      url: `0.0.0.0:${port}`,
    },
  });

  await app.startAllMicroservices();

  const dataSource = app.get(DataSource);
  const userRepository = dataSource.getRepository(User);
  const userExists = await userRepository.findOne({
    where: { email: 'teste@teste.com' },
  });

  if (!userExists) {
    await userRepository.save({
      email: 'teste@teste.com',
      name: 'Usuário Teste Real',
    });
  }

  await app.listen(3001);
}
bootstrap();
