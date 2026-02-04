export interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
}

export interface EmailSenderPort {
  send(options: SendEmailOptions): Promise<void>;
}

export const EMAIL_SENDER_PORT = Symbol('EMAIL_SENDER_PORT');
