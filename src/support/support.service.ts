import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SupportTicket,
  SupportTicketDocument,
} from './schemas/support-ticket.schema';
import { SupportGateway } from './support.gateway';
import { Counter, CounterDocument } from './schemas/counter.schema';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(SupportTicket.name)
    private supportTicketModel: Model<SupportTicketDocument>,
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
    private supportGateway: SupportGateway,
  ) {}

  private async generateTicketNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    const prefix = `OS-${year}${month}`;
    const counter = await this.counterModel.findByIdAndUpdate(
      prefix,
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );

    if (!counter) {
      throw new InternalServerErrorException('Falha ao gerar numeração da OS');
    }

    const sequence = counter.seq.toString().padStart(4, '0');
    return `${prefix}-${sequence}`;
  }

  async createTicket(
    tenantId: string,
    requesterName: string,
    subject: string,
    description: string,
    priority: string = 'MEDIUM',
    photoUrl?: string
  ) {
    const ticketNumber = await this.generateTicketNumber();

    const newTicket = new this.supportTicketModel({
      ticketNumber,
      tenantId,
      requesterName,
      subject,
      description,
      priority,
      photoUrl,
      status: 'INBOX',
      messages: [],
    });

    const savedTicket = await newTicket.save();

    const populatedTicket = await this.supportTicketModel
      .findById(savedTicket._id)
      .populate('tenantId', 'tradeName corporateName')
      .exec();

    this.supportGateway.emitNewTicket(populatedTicket);

    return savedTicket;
  }

  async updateTicketStatus(ticketId: string, newStatus: string) {
    const updatedTicket = await this.supportTicketModel.findByIdAndUpdate(
      ticketId,
      { status: newStatus },
      { new: true }
    ).exec();

    if (updatedTicket) {
      this.supportGateway.emitTicketStatusChanged(ticketId, newStatus);
    }
    return updatedTicket;
  }

  async addMessage(ticketId: string, sender: 'SUPPORT' | 'CLIENT', messageText: string) {
    const newMessage = {
      sender,
      message: messageText,
      createdAt: new Date(),
    };

    const updatedTicket = await this.supportTicketModel.findByIdAndUpdate(
      ticketId,
      { 
        $push: { messages: newMessage },
        updatedAt: new Date()
      },
      { new: true }
    ).exec();

    if (!updatedTicket) {
      throw new NotFoundException('Ordem de Serviço não encontrada na base.');
    }

    if (sender === 'CLIENT' && updatedTicket.status === 'WAITING_CLIENT') {
      await this.updateTicketStatus(ticketId, 'IN_PROGRESS'); 
    }

    this.supportGateway.emitNewMessage(ticketId, newMessage);
    return newMessage;
  }

  async findAllTickets() {
    return await this.supportTicketModel
      .find()
      .populate('tenantId', 'tradeName corporateName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findTicketsByTenant(tenantId: string) {
    return await this.supportTicketModel
      .find({ tenantId })
      .sort({ createdAt: -1 })
      .exec();
  }
}
