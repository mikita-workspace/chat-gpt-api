import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { CsmService } from './csm.service';
import { CreateCsmDto } from './dto/create-csm.dto';
import { UpdateCsmDto } from './dto/update-csm.dto';

@Controller('csm')
export class CsmController {
  constructor(private readonly csmService: CsmService) {}

  @Post()
  create(@Body() createCsmDto: CreateCsmDto) {
    return this.csmService.create(createCsmDto);
  }

  @Get()
  findAll() {
    return this.csmService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.csmService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCsmDto: UpdateCsmDto) {
    return this.csmService.update(+id, updateCsmDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.csmService.remove(+id);
  }
}
