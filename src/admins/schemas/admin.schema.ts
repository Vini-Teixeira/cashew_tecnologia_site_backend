import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AdminDocument = HydratedDocument<Admin>;

@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop()
  phone?: string;

  @Prop({ required: true, default: 'SUPER_ADMIN' })
  role!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  photoUrl?: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);