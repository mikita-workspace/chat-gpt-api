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
import { HttpExceptionFilter } from 'src/common/exceptions';
import { RolesAuth } from 'src/modules/auth/decorators';
import { RolesAuthGuard } from 'src/modules/auth/guard';

import { AdminsService } from './admins.service';
import { AdminRoles } from './constants';
import { BanAdminDto } from './dto/ban-admin.dto';
import { ChangeRoleAdminDto } from './dto/change-role-admin.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@UseFilters(new HttpExceptionFilter())
@UseGuards(RolesAuthGuard)
@Controller('api/admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @RolesAuth(AdminRoles.SUPER_ADMIN)
  @Post()
  async create(@Body() createAdminDto: CreateAdminDto) {
    const admin = await this.adminsService.findOneByEmail(createAdminDto.email);

    if (admin) {
      throw new ConflictException(`${admin.admin_id} already exist`);
    }

    return this.adminsService.create(createAdminDto);
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @Get()
  async findAll() {
    return this.adminsService.findAll();
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const admin = await this.adminsService.findOne(id);

    if (!admin) {
      throw new NotFoundException(`${id} not found`);
    }

    return admin;
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @Get('email/:email')
  async findOneByEmail(@Param('email') email: string) {
    const admin = await this.adminsService.findOneByEmail(email);

    if (!admin) {
      throw new NotFoundException(`${email} not found`);
    }

    return admin;
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    const admin = await this.adminsService.findOne(id);

    if (!admin) {
      throw new NotFoundException(`${id} not found`);
    }

    return this.adminsService.update(id, updateAdminDto);
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const admin = await this.adminsService.findOne(id);

    if (!admin) {
      throw new NotFoundException(`${id} not found`);
    }

    return this.adminsService.remove(id);
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN)
  @Post('change-role')
  async changeRole(@Body() addRoleAdminDto: ChangeRoleAdminDto) {
    const { adminId: id } = addRoleAdminDto;

    const admin = await this.adminsService.findOne(id);

    if (!admin) {
      throw new NotFoundException(`${id} not found`);
    }

    return this.adminsService.changeRole(addRoleAdminDto);
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @Post('block')
  async block(@Body() banAdminDto: BanAdminDto) {
    const { adminId: id } = banAdminDto;

    const admin = await this.adminsService.findOne(id);

    if (!admin) {
      throw new NotFoundException(`${id} not found`);
    }

    return this.adminsService.block(banAdminDto);
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @Post('unblock/:id')
  async unblock(@Param('id') id: string) {
    const admin = await this.adminsService.findOne(id);

    if (!admin) {
      throw new NotFoundException(`${id} not found`);
    }

    return this.adminsService.unblock(id);
  }
}
