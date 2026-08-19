import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TenantDocument = HydratedDocument<Tenant>;

@Schema({ _id: false })
export class Responsible {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  cpf!: string;

  @Prop({ required: true })
  role!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  phone!: string;
}
const ResponsibleSchema = SchemaFactory.createForClass(Responsible);

@Schema({ _id: true })
export class OperationalBase {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  address!: string;

  @Prop({ required: true, type: Number })
  latitude!: number;

  @Prop({ required: true, type: Number })
  longitude!: number;

  @Prop({ default: false })
  isPrimary!: boolean;
}
const OperationalBaseSchema = SchemaFactory.createForClass(OperationalBase);

@Schema({ _id: false })
export class ProjectConfig {
  @Prop({ required: true })
  projectName!: string;

  @Prop({ required: true })
  status!: 'ACTIVE' | 'SUSPENDED' | 'CANCELED';

  @Prop({ required: true })
  totalLicenses!: number;

  @Prop({ required: true, default: 0 })
  monthlyFee!: number;

  @Prop({ default: 0 })
  setupFee!: number;

  @Prop({ required: true, min: 1, max: 31, default: 10 })
  billingDay!: number;

  @Prop()
  customDomain?: string;

  @Prop({ type: [String], default: [] })
  allowedModules!: string[];
}
const ProjectConfigSchema = SchemaFactory.createForClass(ProjectConfig);

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true })
  corporateName!: string;

  @Prop({ required: true })
  tradeName!: string;

  @Prop({ required: true, unique: true })
  cnpj!: string;

  @Prop({ type: [OperationalBaseSchema], default: [] })
  bases!: OperationalBase[];

  @Prop({ 
    required: true, 
    enum: ['ACTIVE', 'IN_DEFAULT', 'SUSPENDED', 'CANCELED'], 
    default: 'ACTIVE' 
  })
  status!: string;

  @Prop({ type: [ResponsibleSchema], default: [] })
  responsibles!: Responsible[];

  @Prop({ type: [ProjectConfigSchema], default: [] })
  projects!: ProjectConfig[];

  @Prop()
  gatewayCustomerId?: string; 

  @Prop()
  gatewaySubscriptionId?: string;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);