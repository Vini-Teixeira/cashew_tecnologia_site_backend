import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { catchError, firstValueFrom } from 'rxjs';
import { AdminsService } from '../admins/admins.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private adminsService: AdminsService,
    private jwtService: JwtService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const admin = await this.adminsService.findByEmail(loginDto.identifier);

    if (admin && admin.password) {
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        admin.password,
      );
      if (isPasswordValid) {
        const payload = {
          sub: admin._id,
          email: admin.email,
          role: admin.role,
        };
        return {
          access_token: this.jwtService.sign(payload),
          user: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
          },
        };
      }
    }
    return this.delegateToFleetEcosystem(loginDto);
  }

  private async delegateToFleetEcosystem(loginDto: LoginDto) {
    const fleetUrl = this.configService.get<string>('FLEET_BACKEND_URL');
    const internalApiKey = this.configService.get<string>('INTERNAL_API_KEY');

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${fleetUrl}/auth/tenant-login`, loginDto, {
          headers: { 'x-api-key': internalApiKey },
        })
      );

      return data;
    } catch (error: any) {
      console.error(
        'ERRO NA DELEGAÇÃO PARA FROTAS:', 
        error.response?.data || error.message
      );
      
      throw new UnauthorizedException(
        'Credenciais inválidas ou usuário não encontrado em nenhum ecossistema.',
      );
    }
  }
}
