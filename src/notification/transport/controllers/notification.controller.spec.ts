import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { EMAIL_SENDER_PORT } from '../../domain/ports/email-sender.port';
import { USER_VALIDATOR_PORT } from '../../domain/ports/user-validator.port';
import { SendEmailDto } from '../dtos/send-email.dto';

describe('NotificationController', () => {
  let controller: NotificationController;
  let emailServiceMock: any;
  let userValidatorMock: any;

  beforeEach(async () => {
    emailServiceMock = { send: jest.fn() };

    userValidatorMock = {
      validate: jest.fn().mockResolvedValue({ isValid: true, name: 'João' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        { provide: EMAIL_SENDER_PORT, useValue: emailServiceMock },
        { provide: USER_VALIDATOR_PORT, useValue: userValidatorMock },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
  });

  it('deve enviar email se o usuário for válido', async () => {
    const payload: SendEmailDto = {
      to: 'valid@test.com',
      subject: 'Oi',
      body: 'Corpo',
    };

    await controller.handleSendEmail(payload);

    expect(userValidatorMock.validate).toHaveBeenCalledWith('valid@test.com');
    expect(emailServiceMock.send).toHaveBeenCalled();
  });

  it('Não deve enviar email se o usuário for inválido', async () => {
    userValidatorMock.validate.mockResolvedValue({ isValid: false });
    const payload: SendEmailDto = {
      to: 'invalid@test.com',
      subject: 'Oi',
      body: 'Corpo',
    };

    await controller.handleSendEmail(payload);

    expect(userValidatorMock.validate).toHaveBeenCalledWith('invalid@test.com');
    expect(emailServiceMock.send).not.toHaveBeenCalled();
  });
});
