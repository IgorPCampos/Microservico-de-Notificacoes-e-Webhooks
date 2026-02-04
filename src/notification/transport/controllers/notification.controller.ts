import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SendEmailDto } from '../dtos/send-email.dto';
import {
  EMAIL_SENDER_PORT,
  type EmailSenderPort,
} from '../../domain/ports/email-sender.port';

@Controller()
export class NotificationController {
  constructor(
    @Inject(EMAIL_SENDER_PORT)
    private readonly emailService: EmailSenderPort,
  ) {}

  @EventPattern('send_email')
  async handleSendEmail(@Payload() data: SendEmailDto) {
    console.log('Mensagem recebida da fila:', data);
    await this.emailService.send(data);
  }
}
