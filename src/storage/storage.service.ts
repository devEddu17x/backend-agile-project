import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { FilePlan } from './interfaces/file-plan.interface';
import { PresignedPut } from './interfaces/presigned-url.interface';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket: string;
  constructor(private readonly configService: ConfigService) {
    const storage = this.configService.get('cloudflare');
    this.s3 = new S3Client(storage.config);
    this.bucket = storage.bucket;
  }

  buildTempKey(prendaId: string, filename: string) {
    const ext = filename.includes('.') ? filename.split('.').pop() : 'bin';
    const uuid = randomUUID();
    return `${prendaId}/tmp/${uuid}.${ext}`;
  }
  async createPresignedPuts(
    prendaId: string,
    files: FilePlan[],
    opts?: { ttlSeconds?: number; cacheControl?: string },
  ): Promise<PresignedPut[]> {
    const ttl = opts?.ttlSeconds ?? 600; // 10 min
    const cacheControl = opts?.cacheControl ?? 'no-cache';

    const results: PresignedPut[] = [];
    for (const f of files) {
      const key = this.buildTempKey(prendaId, f.filename);

      const cmd = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: f.contentType,
        CacheControl: cacheControl,
      });

      const putUrl = await getSignedUrl(this.s3, cmd, { expiresIn: ttl });
      const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();

      results.push({
        key,
        putUrl,
        expiresAt,
        requiredHeaders: {
          'Content-Type': f.contentType,
        },
      });
    }
    return results;
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.s3.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }
}
