import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'O identificador (E-mail ou CPF) é obrigatório.' })
  identifier!: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  password!: string;
}