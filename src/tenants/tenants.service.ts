import {
  Injectable,
  ConflictException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from './schemas/tenant.schema';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private readonly httpService: HttpService,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const existingTenant = await this.tenantModel.findOne({ cnpj: createTenantDto.cnpj }).exec();
    
    if (existingTenant) {
      throw new ConflictException('Já existe um cliente cadastrado com este CNPJ.');
    }

    const newTenant = new this.tenantModel(createTenantDto);
    const savedTenant = await newTenant.save();

    const fleetBackendUrl = process.env.FLEET_BACKEND_URL || 'http://localhost:3000';
    const apiKey = process.env.INTERNAL_API_KEY || 'chave_secreta_cashew_enterprise_2026';

    try {
      const directorData = createTenantDto.responsibles[0];
      const payloadDirector = {
        name: directorData.name,
        email: directorData.email,
        cpf: directorData.cpf,
        phone: directorData.phone,
        password: directorData.password,
        role: 'DIRECTOR',
        tenantName: savedTenant.tradeName,
        tenantId: savedTenant._id.toString(),
        permissions: createTenantDto.projects[0]?.allowedModules || [] 
      };

      await firstValueFrom(
        this.httpService.post(`${fleetBackendUrl}/auth/provision-director`, payloadDirector, {
          headers: { 'x-api-key': apiKey }
        })
      );
      this.logger.log(`[SUCESSO] Diretor provisionado no Frotas para: ${savedTenant.tradeName}`);
    } catch (error) {
      this.logger.error(`[FALHA] Erro ao provisionar Diretor no Frotas`);
    }

    try {
      const payloadBase = {
        name: `Base Principal - ${savedTenant.tradeName}`,
        address: createTenantDto.address,
        latitude: createTenantDto.latitude,
        longitude: createTenantDto.longitude,
        radiusInMeters: 500,
        tenantId: savedTenant._id.toString()
      };

      await firstValueFrom(
        this.httpService.post(`${fleetBackendUrl}/bases/provision`, payloadBase, {
          headers: { 'x-api-key': apiKey }
        })
      );
      this.logger.log(`[SUCESSO] Base Operacional provisionada para: ${savedTenant.tradeName}`);
    } catch (error) {
      this.logger.error(`[FALHA] Erro ao provisionar Base no Frotas`);
    }

    try {
      const payloadParameters = {
        tenantId: savedTenant._id.toString()
      };

      await firstValueFrom(
        this.httpService.post(`${fleetBackendUrl}/parameters/provision`, payloadParameters, {
          headers: { 'x-api-key': apiKey }
        })
      );
      this.logger.log(`[SUCESSO] Parâmetros padrão provisionados para: ${savedTenant.tradeName}`);
    } catch (error) {
      this.logger.error(`[FALHA] Erro ao provisionar Parâmetros no Frotas`);
    }

    return savedTenant;
  }

  // ... (Mantenha os métodos updateStatus e findAll intactos)
  async updateStatus(id: string, status: string): Promise<Tenant> {
    const updatedTenant = await this.tenantModel
      .findByIdAndUpdate(id, { status: status }, { new: true })
      .exec();

    if (!updatedTenant) {
      throw new NotFoundException('Cliente não encontrado no sistema.');
    }

    const isActive = status === 'ACTIVE';
    try {
      const frotasUrl =
        process.env.FROTAS_API_URL || 'http://localhost:3000/api';
      await fetch(`${frotasUrl}/auth/tenant-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key':
            process.env.INTERNAL_API_KEY || 'sua_chave_secreta_interna',
        },
        body: JSON.stringify({ tenantId: id, isActive: isActive }),
      });
      console.log(
        `📡 [Ponte Cashew -> Frotas] Status do Tenant atualizado para isActive: ${isActive}`,
      );
    } catch (error) {
      console.error(
        '🔥 Falha ao comunicar com o servidor do Gestão de Frotas:',
        error,
      );
    }
    return updatedTenant;
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantModel.find().exec();
  }
}
