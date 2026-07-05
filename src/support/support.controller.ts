import { Controller, Post, Body, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-strategy/jwt-auth.guard';
import { ApiKeyGuard } from '../auth/api-key-strategy/api-key.guard';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @UseGuards(ApiKeyGuard)
  @Post('tickets')
  async createTicket(@Body() createTicketDto: CreateTicketDto) {
    return await this.supportService.createTicket(
      createTicketDto.tenantId!,
      createTicketDto.requesterName!,
      createTicketDto.subject!,
      createTicketDto.description!,
      createTicketDto.priority || 'MEDIUM',
      createTicketDto.photoUrl
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('tickets/:id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return await this.supportService.updateTicketStatus(id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Get('tickets')
  async getAllTickets() {
    return await this.supportService.findAllTickets();
  }

  @UseGuards(JwtAuthGuard)
  @Get('tickets/tenant/:tenantId')
  async getTicketsByTenant(@Param('tenantId') tenantId: string) {
    return await this.supportService.findTicketsByTenant(tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('tickets/:id/messages')
  async addMessage(
    @Param('id') id: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return await this.supportService.addMessage(
      id,
      createMessageDto.sender,
      createMessageDto.message,
    );
  }

  @UseGuards(ApiKeyGuard)
  @Get('m2m/tickets/tenant/:tenantId')
  async m2mGetTicketsByTenant(@Param('tenantId') tenantId: string) {
    return await this.supportService.findTicketsByTenant(tenantId);
  }

  @UseGuards(ApiKeyGuard)
  @Post('m2m/tickets/:id/messages')
  async m2mAddMessage(
    @Param('id') id: string,
    @Body() body: { sender: 'CLIENT' | 'SUPPORT', message: string },
  ) {
    return await this.supportService.addMessage(id, body.sender, body.message);
  }
}