import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin, AdminDocument } from './schemas/admin.schema';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<Omit<Admin, 'password'>> {
    const existingAdmin = await this.adminModel.findOne({ email: createAdminDto.email }).exec();
    
    if (existingAdmin) {
      throw new ConflictException('Já existe um administrador com este e-mail.');
    }

    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);
    const newAdmin = new this.adminModel({
      ...createAdminDto,
      password: hashedPassword,
    });

    const savedAdmin = await newAdmin.save();
    const { password, ...adminData } = savedAdmin.toObject();
    return adminData;
  }

  async findByEmail(email: string) {
    return this.adminModel.findOne({ email, isActive: true }).exec();
  }
}