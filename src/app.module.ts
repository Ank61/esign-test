/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EsignModule } from './esign/esign.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), EsignModule],
})
export class AppModule {}
