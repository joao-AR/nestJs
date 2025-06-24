import { ClassSerializerInterceptor, INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WrapperDataInterceptor } from './shared/infrastructure/interceptors/wrapper-data/wrapper-data.interceptor';

export function applyGlobalConfig(app: INestApplication) {
  new WrapperDataInterceptor();
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
}
