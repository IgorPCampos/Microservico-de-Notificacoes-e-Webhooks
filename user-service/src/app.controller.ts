import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @GrpcMethod('UserService', 'ValidateUser')
  async validateUser(data: { email: string }) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (user) {
      const result = { is_valid: true, id: user.id, name: user.name };
      return result;
    } else {
      return { is_valid: false, id: '', name: '' };
    }
  }
}
