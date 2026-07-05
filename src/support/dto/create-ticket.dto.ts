import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty({ message: 'O ID da empresa (Tenant) é obrigatório.' })
  tenantId!: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome do solicitante é obrigatório.' })
  requesterName!: string;

  @IsString()
  @IsNotEmpty({ message: 'O assunto do chamado é obrigatório.' })
  subject!: string;

  @IsString()
  @IsNotEmpty({ message: 'A descrição do problema é obrigatória.' })
  description!: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    message: 'Prioridade inválida. Use LOW, MEDIUM, HIGH ou CRITICAL.',
  })
  priority!: string;
}