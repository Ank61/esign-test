import { Module } from '@nestjs/common';
import { EsignController } from './esign.controller';
import { EsignService } from './esign.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [EsignController],
  providers: [EsignService],
})
export class EsignModule {}
