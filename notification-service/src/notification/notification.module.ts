import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationController } from './transport/controllers/notification.controller';
import { SendGridService } from './infrastructure/services/sendgrid.service';
import { GrpcUserService } from './infrastructure/services/grpc-user.service';
import { EMAIL_SENDER_PORT } from './domain/ports/email-sender.port';
import { USER_VALIDATOR_PORT } from './domain/ports/user-validator.port';

const PROTO_PATH = join(
  process.cwd(),
  'dist/notification/domain/proto/notification-service.proto',
);

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'USER_PACKAGE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'user',
            protoPath: PROTO_PATH,
            url: configService.get('USER_GRPC_URL') as string,
            loader: {
              keepCase: true,
              defaults: true,
              oneofs: true,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    { provide: EMAIL_SENDER_PORT, useClass: SendGridService },
    { provide: USER_VALIDATOR_PORT, useClass: GrpcUserService },
  ],
})
export class NotificationModule {}
