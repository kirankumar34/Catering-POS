import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Controller('menus')
@UseGuards(JwtAuthGuard)
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'OWNER')
  @UseGuards(RolesGuard)
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.menusService.findAll({
      search,
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(id);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'OWNER')
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menusService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'OWNER')
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.menusService.remove(id);
  }
}
