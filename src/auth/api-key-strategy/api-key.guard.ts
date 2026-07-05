import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    
    const validApiKey = process.env.CASHEW_INTERNAL_API_KEY;

    console.log('--- TESTE DO GUARD ---');
    console.log('1. Recebido do Postman:', apiKey);
    console.log('2. Lendo direto do .env:', process.env.CASHEW_INTERNAL_API_KEY);
    console.log('3. Valor Final Validado:', validApiKey);
    console.log('----------------------');

    if (!apiKey) {
      throw new UnauthorizedException('Acesso negado. Chave de API ausente.');
    }

    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Acesso negado. Chave de API inválida.');
    }

    return true;
  }
}