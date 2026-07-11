import { Controller, Post, Body, Patch, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@Request() req: any) {
    return this.adminsService.getProfile(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  async updateProfile(@Request() req: any, @Body() body: any) {
    return this.adminsService.updateProfile(req.user.userId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me/password')
  async updatePassword(@Request() req: any, @Body() body: any) {
    return this.adminsService.updatePassword(
      req.user.userId, 
      body.currentPassword, 
      body.newPassword
    );
  }
}