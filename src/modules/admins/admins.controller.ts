import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { RolesAuth } from '@/modules/auth/decorators';
import { RolesAuthGuard } from '@/modules/auth/guard';

import { AdminsService } from './admins.service';
import { AdminRoles } from './constants';
import { ChangeRoleAdminDto } from './dto/change-role-admin.dto';
import { ChangeStateAdminDto } from './dto/change-state-admin.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@UseGuards(RolesAuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @RolesAuth(AdminRoles.SUPER_ADMIN)
  @Post()
  async create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @Get()
  async findAll() {
    return this.adminsService.findAll({});
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @Get(':email')
  async findOne(@Param('email') email: string) {
    return this.adminsService.findOne(email);
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN)
  @Patch(':email')
  async update(@Param('email') email: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminsService.update(email, updateAdminDto);
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN)
  @Delete(':email')
  async remove(@Param('email') email: string) {
    return this.adminsService.remove(email);
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN)
  @Post('changeRole')
  async changeRole(@Body() changeRoleAdminDto: ChangeRoleAdminDto) {
    return this.adminsService.changeRole(changeRoleAdminDto);
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @Post('changeState')
  async changeState(@Body() changeStateAdminDto: ChangeStateAdminDto) {
    return this.adminsService.changeState(changeStateAdminDto);
  }
}
