import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { UserRoles } from '../../common/enums/user-roles.enum';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { Roles } from '../../decorators/role.decorator';
import { RolesGuard } from '../../guards/roles.guards';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMyAccount(@Req() req: Request) {
    const user: JwtPayload = req.user as JwtPayload;

    return this.userService.findOne(+user.id);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RolesGuard)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Patch('update')
  update(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const user: JwtPayload = req.user as JwtPayload;
    return this.userService.update(+user.id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRoles.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
