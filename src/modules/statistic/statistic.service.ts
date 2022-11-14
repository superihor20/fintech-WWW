import { Injectable } from '@nestjs/common';

@Injectable()
export class StatisticService {
  getStatistic() {
    return 'statistic';
  }
}
