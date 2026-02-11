import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { User } from './user.entity';

async function bootstrap() {
  const port = process.env.GRPC_USER_PORT;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'user',
        protoPath: join(__dirname, 'domain/proto/user-service.proto'),
        url: `0.0.0.0:${port}`,
      },
    },
  );

  await app.listen();

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
    console.log('🌱 Seed: Usuário de teste inserido no Postgres!');
  }

  console.log(`🚀 User Service odando com PostgreSQL na porta ${port}`);
}
bootstrap();
