import { Test, TestingModule } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from '../app.controller';
import { User } from '../user.entity';
import { DataSource } from 'typeorm';

describe('UserService Integration (com Testcontainers)', () => {
  let container: StartedPostgreSqlContainer;
  let module: TestingModule;
  let controller: AppController;
  let dataSource: DataSource;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:15-alpine')
      .withDatabase('test_db')
      .withUsername('test_user')
      .withPassword('test_pass')
      .start();
  }, 60000);

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: container.getHost(),
          port: container.getMappedPort(5432),
          username: container.getUsername(),
          password: container.getPassword(),
          database: container.getDatabase(),
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
      ],
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('deve validar um usuário que foi inserido no banco', async () => {
    const repo = dataSource.getRepository(User);
    await repo.save({
      name: 'Usuario Testcontainers',
      email: 'container@teste.com',
    });

    const response = await controller.validateUser({
      email: 'container@teste.com',
    });

    expect(response.is_valid).toBe(true);
    expect(response.name).toBe('Usuario Testcontainers');
    expect(response.id).toBeDefined();
  });

  it('deve retornar false para usuário inexistente', async () => {
    const response = await controller.validateUser({
      email: 'fantasma@teste.com',
    });

    expect(response.is_valid).toBe(false);
  });

  afterAll(async () => {
    await module.close();
    await container.stop();
  });
});
