import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.GRPC_USER_PORT;
const PROTO_PATH = path.join(
  process.cwd(),
  'src/notification/domain/proto/user-service.proto',
);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;

const userPackage = protoDescriptor.user;

const userService = userPackage
  ? userPackage.UserService.service
  : protoDescriptor.UserService.service;

function validateUser(call: any, callback: any) {
  const email = call.request.email;
  console.log(`Chamada recebida para: ${email}`);

  if (email === 'teste@teste.com') {
    console.log('Válido');
    callback(null, { is_valid: true, id: '123', name: 'Mock User' });
  } else {
    console.log('Inválido');
    callback(null, { is_valid: false });
  }
}

function main() {
  const server = new grpc.Server();

  server.addService(userService, { ValidateUser: validateUser });

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Servidor Mock rodando na porta ${port}`);
    },
  );
}

main();
