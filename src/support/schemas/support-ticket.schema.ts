import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SupportTicketDocument = SupportTicket & Document;

@Schema({ timestamps: true })
export class SupportTicket {
  @Prop({ required: true, unique: true })
  ticketNumber!: string;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  requesterName!: string;

  @Prop({ required: true })
  subject!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: false })
  photoUrl?: string;

  @Prop({
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM',
  })
  priority!: string;

  @Prop({
    required: true,
    enum: ['INBOX', 'IN_PROGRESS', 'WAITING_CLIENT', 'RESOLVED'],
    default: 'INBOX',
  })
  status!: string;

  @Prop([
    {
      sender: { type: String, enum: ['CLIENT', 'SUPPORT'] },
      message: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ])
  messages!: Record<string, any>[];
}

export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicket);