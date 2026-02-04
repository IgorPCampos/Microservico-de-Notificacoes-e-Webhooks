import { Module } from '@nestjs/common';
import { NotificationController } from './transport/controllers/notification.controller';
import { SendGridService } from './infrastructure/services/sendgrid.service';
import { EMAIL_SENDER_PORT } from './domain/ports/email-sender.port';

@Module({
  controllers: [NotificationController],
  providers: [
    {
      provide: EMAIL_SENDER_PORT,
      useClass: SendGridService,
    },
  ],
})
export class NotificationModule {}
