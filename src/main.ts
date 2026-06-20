import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    app.enableCors({
    origin: [
      'http://localhost:4200', 
      'http://localhost:4201',
      'https://www.cashewtecnologia.com.br',
      'https://cashewtecnologia.com.br',
      'https://moven-track-frotas.vercel.app'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, x-api-key',
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();