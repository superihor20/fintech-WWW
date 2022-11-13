import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AllExceptionsFilter } from './common/helpers/exception-filter';
import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(process.env.port || 4200);
}

bootstrap();
