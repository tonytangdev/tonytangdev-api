import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SocialPlatform } from '../../../../../../domain/value-objects/social-platform.vo';

@Schema({ _id: false })
export class SocialLinkSchema {
  @Prop({ required: true, type: String, enum: Object.values(SocialPlatform) })
  platform: SocialPlatform;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  username: string;
}

export const SocialLinkMongooseSchema =
  SchemaFactory.createForClass(SocialLinkSchema);
export type SocialLinkDocument = SocialLinkSchema & Document;
