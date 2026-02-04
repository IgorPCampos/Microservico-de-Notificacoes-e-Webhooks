import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { EMAIL_SENDER_PORT } from '../../domain/ports/email-sender.port';
import { SendEmailDto } from '../dtos/send-email.dto';

describe('NotificationController', () => {
  let controller: NotificationController;
  let emailServiceMock: any;

  beforeEach(async () => {
    emailServiceMock = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: EMAIL_SENDER_PORT,
          useValue: emailServiceMock,
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
  });

  it('deve receber um evento e chamar o serviço de email', async () => {
    const payload: SendEmailDto = {
      to: 'cliente@teste.com',
      subject: 'Oferta',
      body: 'Conteúdo',
    };

    await controller.handleSendEmail(payload);

    expect(emailServiceMock.send).toHaveBeenCalledWith(payload);
  });
});
