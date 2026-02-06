import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Controller('notifications')
export class AppController {
  constructor(
    @Inject('NOTIFICATION_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  async sendEmail(@Body() data: any) {
    await lastValueFrom(this.client.emit('send_email', data));

    return {
      message: 'Email colocado na fila com sucesso!',
      status: 'queued',
    };
  }
}
