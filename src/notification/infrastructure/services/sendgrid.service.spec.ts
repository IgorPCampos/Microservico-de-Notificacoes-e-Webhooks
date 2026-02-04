import { Test, TestingModule } from '@nestjs/testing';
import { SendGridService } from './sendgrid.service';
import { EmailSenderPort } from '../../domain/ports/email-sender.port';

describe('SendGridService', () => {
  let service: EmailSenderPort;

  const mockSendGridSdk = {
    send: jest.fn().mockResolvedValue([{ statusCode: 202 }]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SendGridService],
    })
      .useMocker((token) => {})
      .compile();

    service = module.get<SendGridService>(SendGridService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve chamar a API do provedor com os parâmetros corretos', async () => {
    const mailData = {
      to: 'teste@dominio.com',
      subject: 'Bem-vindo',
      body: '<p>Olá!</p>',
    };

    const sendSpy = jest.spyOn(service, 'send');

    await service.send(mailData);

    expect(sendSpy).toHaveBeenCalledWith(mailData);
  });
});
