import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME!;
    
    this.s3Client = new S3Client({
      region: 'af-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadImage(file: Buffer, mimeType: string, userId: string): Promise<string> {
    const fileExtension = this.getFileExtension(mimeType);
    const fileName = `posts/${userId}/${crypto.randomUUID()}.${fileExtension}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file,
      ContentType: mimeType,
      CacheControl: 'max-age=31536000',
    });

    await this.s3Client.send(command);
    
    return `https://${this.bucketName}.s3.af-south-1.amazonaws.com/${fileName}`;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const key = this.extractKeyFromUrl(imageUrl);
    if (!key) return;

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  async getPresignedUploadUrl(mimeType: string, userId: string): Promise<{ uploadUrl: string; imageUrl: string }> {
    const fileExtension = this.getFileExtension(mimeType);
    const fileName = `posts/${userId}/${crypto.randomUUID()}.${fileExtension}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      ContentType: mimeType,
      CacheControl: 'max-age=31536000',
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // 1 hour
    const imageUrl = `https://${this.bucketName}.s3.af-south-1.amazonaws.com/${fileName}`;

    return { uploadUrl, imageUrl };
  }

  private getFileExtension(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    
    return mimeToExt[mimeType] || 'jpg';
  }

  private extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.slice(1);
    } catch {
      return null;
    }
  }

  validateImageType(mimeType: string): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    return allowedTypes.includes(mimeType);
  }

  validateImageSize(fileSize: number): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return fileSize <= maxSize;
  }
}