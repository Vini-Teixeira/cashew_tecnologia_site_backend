import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupportTicket, SupportTicketSchema } from './schemas/support-ticket.schema';
import { Counter, CounterSchema } from './schemas/counter.schema';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { SupportGateway } from './support.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupportTicket.name, schema: SupportTicketSchema },
      { name: Counter.name, schema: CounterSchema },
    ]),
  ],
  providers: [SupportService, SupportGateway],
  controllers: [SupportController],
  exports: [SupportService],
})
export class SupportModule {}