import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as Cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    Cloudinary.config({
      api_key: configService.get('cloudinary.apiKey'),
      api_secret: configService.get('cloudinary.apiSecret'),
      cloud_name: configService.get('cloudinary.cloudName'),
      secure: true,
    });
  }

  async uploadBase64(base64s: string[], options: { folder?: string; public_id?: string }) {
    const { folder, public_id } = options;

    const cloudinaryRequests = base64s.map((base64) =>
      Cloudinary.uploader.upload(`data:image/jpeg;base64,${base64}`, {
        resource_type: 'image',
        folder,
        public_id,
      }),
    );

    try {
      const responses = await Promise.all(cloudinaryRequests);

      return responses.map((response) => ({
        bytes: response.bytes,
        height: response.height,
        url: response.url,
        width: response.width,
      }));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
