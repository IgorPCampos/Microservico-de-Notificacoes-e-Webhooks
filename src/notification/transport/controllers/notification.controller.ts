import { Controller, Inject, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SendEmailDto } from '../dtos/send-email.dto';
import {
  EMAIL_SENDER_PORT,
  type EmailSenderPort,
} from '../../domain/ports/email-sender.port';
import {
  USER_VALIDATOR_PORT,
  type UserValidatorPort,
} from '../../domain/ports/user-validator.port';

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(
    @Inject(EMAIL_SENDER_PORT)
    private readonly emailService: EmailSenderPort,

    @Inject(USER_VALIDATOR_PORT)
    private readonly userValidator: UserValidatorPort,
  ) {}

  @EventPattern('send_email')
  async handleSendEmail(@Payload() data: SendEmailDto) {
    this.logger.log(`Nova mensagem recebida para: ${data.to}`);

    const validation = await this.userValidator.validate(data.to);

    if (!validation.isValid) {
      this.logger.warn(
        `Usuário inválido ou inexistente: ${data.to}. E-mail descartado.`,
      );
      return;
    }

    this.logger.log(
      `Usuário validado: ${validation.name || 'Desconhecido'}. Enviando...`,
    );
    await this.emailService.send(data);
  }
}
