import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateMessageDto {
  @IsEnum(['SUPPORT', 'CLIENT'], {
    message: 'Remetente inválido. Deve ser SUPPORT ou CLIENT.',
  })
  sender!: 'SUPPORT' | 'CLIENT';

  @IsString()
  @IsNotEmpty({ message: 'A mensagem não pode estar vazia.' })
  message!: string;
}