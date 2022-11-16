import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UserRoles } from '../../common/enums/user-roles.enum';
import { Roles } from '../../decorators/role.decorator';
import { RolesGuard } from '../../guards/roles.guards';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

import { StatisticService } from './statistic.service';

@ApiTags('Statistic')
@Roles(UserRoles.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Get()
  @Render('statistic')
  getStatistic() {
    return this.statisticService.getStatistic();
  }
}
