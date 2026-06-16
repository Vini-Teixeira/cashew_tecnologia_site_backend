import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class ResponsibleDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do responsável é obrigatório.' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'O cargo do responsável é obrigatório.' })
  role!: string;

  @IsString()
  @IsNotEmpty({ message: 'O e-mail do responsável é obrigatório.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'O telefone do responsável é obrigatório.' })
  phone!: string;

  // 🚀 O CPF é vital para o Login Universal no Frotas
  @IsString()
  @IsNotEmpty({ message: 'O CPF é obrigatório.' })
  cpf!: string;

  // 🚀 A senha inicial definida por você e seu sócio
  @IsString()
  @IsNotEmpty({ message: 'A senha inicial é obrigatória.' })
  password!: string;
}

export class ProjectConfigDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do projeto é obrigatório.' })
  projectName!: string;

  @IsEnum(['ACTIVE', 'SUSPENDED', 'CANCELED'])
  status!: string;

  @IsNumber()
  totalLicenses!: number;

  @IsString()
  @IsOptional()
  customDomain?: string;

  // 🚀 A matriz de permissões para controlar o App do Gestor
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedModules?: string[];
}

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty({ message: 'A Razão Social é obrigatória.' })
  corporateName!: string;

  @IsString()
  @IsNotEmpty({ message: 'O Nome Fantasia é obrigatório.' })
  tradeName!: string;

  @IsString()
  @IsNotEmpty({ message: 'O CNPJ é obrigatório.' })
  cnpj!: string;

  @IsEnum(['ACTIVE', 'IN_DEFAULT', 'SUSPENDED', 'CANCELED'])
  @IsOptional()
  status?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponsibleDto)
  responsibles!: ResponsibleDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectConfigDto)
  projects!: ProjectConfigDto[];
}