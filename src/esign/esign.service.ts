/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EsignService {
  private apiKey: string;
  private uploadDir: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>(
      'OPEN_SIGN_API_KEY',
      'default-api-key',
    ); // Provide a default or throw an error
    fs.mkdir(this.uploadDir, { recursive: true }).catch((err) =>
        console.error('Failed to create upload directory:', err),
      );
  }

  async uploadPdf(
    file: Express.Multer.File,
    role1Email: string,
  ): Promise<string> {
    const filePath = join(this.uploadDir, `${Date.now()}-${file.originalname}`);
    await fs.writeFile(filePath, file.buffer);

    // Hardcoded eSign tags for Role 2 and Role 3
    const templateData = {
      file: filePath,
      signers: [
        { email: role1Email, role: 'Role 1' },
        { email: 'dummy@role2.com', role: 'Role 2' }, // Placeholder for Role 2
        { email: '', role: 'Role 3' }, // Placeholder for Role 3
      ],
      tags: [
        { role: 'Role 2', type: 'signature', x: 100, y: 200, page: 1 },
        { role: 'Role 3', type: 'signature', x: 100, y: 300, page: 1 },
      ],
    };

    const response = await firstValueFrom(
      this.httpService.post(
        'https://api.opensignlabs.com/templates',
        templateData,
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        },
      ),
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.data.id; // Template ID
  }

  async signDocument(documentId: string, signerEmail: string): Promise<string> {
    const response = await firstValueFrom(
      this.httpService.post(
        'https://api.opensignlabs.com/sign',
        { documentId, signerEmail },
        { headers: { Authorization: `Bearer ${this.apiKey}` } },
      ),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.data.url; // Signing URL
  }

  async forwardToRole3(
    documentId: string,
    role3Email: string,
  ): Promise<string> {
    const response = await firstValueFrom(
      this.httpService.patch(
        `https://api.opensignlabs.com/documents/${documentId}`,
        { signers: [{ email: role3Email, role: 'Role 3' }] },
        { headers: { Authorization: `Bearer ${this.apiKey}` } },
      ),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.data.id;
  }
}
