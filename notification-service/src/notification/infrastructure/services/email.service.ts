import { Injectable, Logger } from '@nestjs/common';
import {
  EmailSenderPort,
  SendEmailOptions,
} from '../../domain/ports/email-sender.port';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService implements EmailSenderPort {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async send({ to, subject, body }: SendEmailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from:
          '"Sistema de Notificações" <' +
          this.configService.get<string>('SMTP_USER') +
          '>',
        to: to,
        subject: subject,
        text: body,
        html: `<div style="font-family: Arial; padding: 20px; background-color: #f4f4f4;">
                <div style="background-color: white; padding: 20px; border-radius: 5px;">
                  <h2 style="color: #333;">${subject}</h2>
                  <p style="font-size: 16px;">${body}</p>
                  <hr>
                  <p style="font-size: 12px; color: #888;">Enviado pelo seu Microserviço 🚀</p>
                </div>
               </div>`,
      });
    } catch (error) {
      throw error;
    }
  }
}
