/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EsignService } from './esign.service';
import { SignDocumentDto } from 'src/interfaces/sign-document.dto';
import { UploadPdfDto } from 'src/interfaces/upload-pdf.dto';
import { ForwardDocumentDto } from 'src/interfaces/forward-document.dto';

@Controller('esign')
export class EsignController {
  constructor(private readonly esignService: EsignService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadPdfDto: UploadPdfDto,
  ): Promise<string> {
    return this.esignService.uploadPdf(file, uploadPdfDto.role1Email);
  }

  @Post('sign')
  async signDocument(
    @Body() signDocumentDto: SignDocumentDto,
  ): Promise<string> {
    return this.esignService.signDocument(
      signDocumentDto.documentId,
      signDocumentDto.signerEmail,
    );
  }

  @Post('forward')
  async forwardToRole3(
    @Body() forwardDocumentDto: ForwardDocumentDto,
  ): Promise<string> {
    return this.esignService.forwardToRole3(
      forwardDocumentDto.documentId,
      forwardDocumentDto.role3Email,
    );
  }
}
