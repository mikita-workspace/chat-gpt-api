import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { RolesAuth } from 'src/auth/decorators';
import { JwtAuthGuard, RolesAuthGuard } from 'src/auth/guard';
import { HttpExceptionFilter } from 'src/common/exceptions';

import { AdminsService } from './admins.service';
import { AdminRoles } from './constants';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@UseGuards(JwtAuthGuard)
@UseFilters(new HttpExceptionFilter())
@Controller('api/admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  async create(@Body() createAdminDto: CreateAdminDto) {
    const admin = await this.adminsService.findOneByEmail(createAdminDto.email);

    if (admin) {
      throw new ConflictException(`AdminId: ${admin.adminId} already exist`);
    }

    return this.adminsService.create(createAdminDto);
  }

  @RolesAuth(AdminRoles.ADMIN)
  @UseGuards(RolesAuthGuard)
  @Get()
  async findAll() {
    return this.adminsService.findAll();
  }

  @Get(':adminId')
  async findOne(@Param('adminId') adminId: string) {
    const admin = await this.adminsService.findOne(adminId);

    if (!admin) {
      throw new NotFoundException(`AdminId: ${adminId} not found`);
    }

    return admin;
  }

  @Patch(':adminId')
  async update(@Param('adminId') adminId: string, @Body() updateAdminDto: UpdateAdminDto) {
    const admin = await this.adminsService.findOne(adminId);

    if (!admin) {
      throw new NotFoundException(`AdminId: ${adminId} not found`);
    }

    return this.adminsService.update(adminId, updateAdminDto);
  }

  @Delete(':adminId')
  async remove(@Param('adminId') adminId: string) {
    const admin = await this.adminsService.findOne(adminId);

    if (!admin) {
      throw new NotFoundException(`AdminId: ${adminId} not found`);
    }

    return this.adminsService.remove(adminId);
  }
}
