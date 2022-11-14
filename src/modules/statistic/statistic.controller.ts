import { Controller, Get } from '@nestjs/common';

import { StatisticService } from './statistic.service';

@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Get()
  getStatistic() {
    return this.statisticService.getStatistic();
  }
}
