import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin, AdminDocument } from './schemas/admin.schema';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminsService implements OnModuleInit {
  private readonly logger = new Logger(AdminsService.name);

  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {}

  async onModuleInit() {
    const count = await this.adminModel.countDocuments();
    if (count === 0) {
      this.logger.log('Semeando o Administrador Fantasma (Bootstrap)...');
      const hashedPassword = await bcrypt.hash('cashew2026', 10);
      
      await this.adminModel.create({
        name: 'Administrador Mestre',
        email: 'master@cashewtecnologia.com.br',
        password: hashedPassword,
        phone: '(00) 00000-0000',
        role: 'SUPER_ADMIN',
        isActive: true
      });
      this.logger.log('Conta Fantasma criada! Email: master@cashewtecnologia.com.br / Senha: cashew2026');
    }
  }

  async getProfile(id: string) {
    const admin = await this.adminModel.findById(id).select('-password').exec();
    if (!admin) throw new NotFoundException('Administrador não encontrado.');
    return admin;
  }

  async create(
    createAdminDto: CreateAdminDto,
  ): Promise<Omit<Admin, 'password'>> {
    const existingAdmin = await this.adminModel
      .findOne({ email: createAdminDto.email })
      .exec();

    if (existingAdmin) {
      throw new ConflictException(
        'Já existe um administrador com este e-mail.',
      );
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

  async updateProfile(id: string, data: any) {
    const updated = await this.adminModel
      .findByIdAndUpdate(
        id,
        {
          name: data.name,
          email: data.email,
          phone: data.phone,
        },
        { new: true },
      )
      .select('-password');

    if (!updated) {
      throw new NotFoundException('Administrador não encontrado no sistema.');
    }
    return updated;
  }

  async updatePassword(id: string, currentPass: string, newPass: string) {
    const admin = await this.adminModel.findById(id);
    if (!admin) {
      throw new NotFoundException('Administrador não encontrado no sistema.');
    }

    const isMatch = await bcrypt.compare(currentPass, admin.password);
    if (!isMatch) {
      throw new BadRequestException(
        'A senha atual está incorreta. Tente novamente.',
      );
    }

    admin.password = await bcrypt.hash(newPass, 10);
    await admin.save();

    return { message: 'Senha atualizada com sucesso.' };
  }
}
