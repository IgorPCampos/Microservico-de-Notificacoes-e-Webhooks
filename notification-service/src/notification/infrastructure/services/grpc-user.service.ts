import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import {
  UserValidationResult,
  UserValidatorPort,
} from '../../domain/ports/user-validator.port';
import { Observable, firstValueFrom } from 'rxjs';

interface UserGrpcService {
  validateUser(data: {
    email: string;
  }): Observable<{ is_valid: boolean; id: string; name: string }>;
}

@Injectable()
export class GrpcUserService implements UserValidatorPort, OnModuleInit {
  private grpcService: UserGrpcService;

  constructor(@Inject('USER_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.grpcService = this.client.getService<UserGrpcService>('UserService');
  }

  async validate(email: string): Promise<UserValidationResult> {
    try {
      const observable = this.grpcService.validateUser({ email });
      const result = await firstValueFrom(observable);

      const isValid =
        result.is_valid === true || (result.id && result.id.length > 0);

      return {
        isValid: !!isValid,
        name: result.name,
      };
    } catch (error) {
      console.error('Erro gRPC:', error);
      return { isValid: false };
    }
  }
}
