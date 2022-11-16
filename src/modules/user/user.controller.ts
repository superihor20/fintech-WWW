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
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';

import { ErrorMessages } from '../../common/constants/errors-messages.constant';
import { UserRoles } from '../../common/enums/user-roles.enum';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { Roles } from '../../decorators/role.decorator';
import { RolesGuard } from '../../guards/roles.guards';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('User')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Return current user' })
  @ApiOkResponse({ type: UserDto })
  @ApiNotFoundResponse({ description: ErrorMessages.USER_NOT_FOUND })
  getMyAccount(@Req() req: Request) {
    const user: JwtPayload = req.user as JwtPayload;

    return this.userService.findOne(+user.id);
  }

  @Get('get-referall-link')
  @Roles(UserRoles.ADMIN, UserRoles.INVESTOR, UserRoles.INVITER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Return referall link' })
  @ApiOkResponse({ description: 'In response will be referall link' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  async getReferallLink(@Req() req: Request) {
    const user: JwtPayload = req.user as JwtPayload;
    const foundUser = await this.userService.findOne(+user.id);

    return `${process.env.HOST}/auth/sign-up?code=${foundUser.inviteCode}`;
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RolesGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Return found user by id (only for admin)' })
  @ApiOkResponse({ type: UserDto })
  @ApiNotFoundResponse({ description: ErrorMessages.USER_NOT_FOUND })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Return all users (only for admin)' })
  @ApiOkResponse({ type: [UserDto] })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  findAll() {
    return this.userService.findAll();
  }

  @Patch('update')
  @ApiOperation({ summary: 'Update current user' })
  @ApiOkResponse({ type: UserDto })
  @ApiNotFoundResponse({ description: ErrorMessages.USER_NOT_FOUND })
  update(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const user: JwtPayload = req.user as JwtPayload;
    return this.userService.update(+user.id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRoles.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove user by id (only for admin)' })
  @ApiNotFoundResponse({ description: ErrorMessages.USER_NOT_FOUND })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiNoContentResponse()
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
