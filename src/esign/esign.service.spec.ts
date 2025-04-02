/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { EsignService } from './esign.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';

describe('EsignService', () => {
  let service: EsignService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EsignService,
        {
          provide: HttpService,
          useValue: { post: jest.fn(), patch: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) =>
              key === 'OPEN_SIGN_API_KEY' ? 'test-key' : './storage/uploads',
            ),
          },
        },
      ],
    }).compile();

    service = module.get<EsignService>(EsignService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should upload PDF and return template ID', async () => {
    const file = {
      buffer: Buffer.from('test'),
      originalname: 'test.pdf',
    } as Express.Multer.File;
    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(of({ data: { id: 'template123' } }));
    const result = await service.uploadPdf(file, 'role1@example.com');
    expect(result).toBe('template123');
  });

  it('should sign document and return signing URL', async () => {
    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(of({ data: { url: 'signing-url' } }));
    const result = await service.signDocument('doc123', 'role2@example.com');
    expect(result).toBe('signing-url');
  });

  it('should forward document to Role 3', async () => {
    jest
      .spyOn(httpService, 'patch')
      .mockReturnValue(of({ data: { id: 'doc123' } }));
    const result = await service.forwardToRole3('doc123', 'role3@example.com');
    expect(result).toBe('doc123');
  });
});
