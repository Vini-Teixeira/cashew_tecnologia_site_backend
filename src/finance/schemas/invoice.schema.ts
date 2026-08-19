import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InvoiceDocument = HydratedDocument<Invoice>;

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  tenantName!: string;

  @Prop({ required: true, type: Number })
  amount!: number;

  @Prop({ required: true, enum: ['PENDING', 'PAID', 'OVERDUE', 'CANCELED'], default: 'PENDING' })
  status!: string;

  @Prop({ required: true })
  dueDate!: Date;

  @Prop()
  paidAt?: Date;

  @Prop()
  gatewayInvoiceId?: string; 

  @Prop()
  boletoUrl?: string;

  @Prop()
  pixQrCode?: string;

  @Prop()
  invoiceDocumentUrl?: string; // Link da Nota Fiscal (NFS-e)
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);