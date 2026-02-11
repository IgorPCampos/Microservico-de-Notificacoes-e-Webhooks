import { Injectable, Logger } from '@nestjs/common';
import {
  EmailSenderPort,
  SendEmailOptions,
} from '../../domain/ports/email-sender.port';

@Injectable()
export class SendGridService implements EmailSenderPort {
  private readonly logger = new Logger(SendGridService.name);

  async send(options: SendEmailOptions): Promise<void> {
    this.logger.log(`[Mock SendGrid] Enviando email para ${options.to}`);

    return Promise.resolve();
  }
}
