import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AvailabilityStatus } from '../../../../../../domain/value-objects/availability-status.vo';
import { SocialLinkSchema } from './social-link.schema';

@Schema({ collection: 'profiles' })
export class ProfileSchema {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  bio: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: false, type: String, default: null })
  phone: string | null;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  timezone: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(AvailabilityStatus),
  })
  availability: AvailabilityStatus;

  @Prop({ required: true })
  yearsOfExperience: number;

  @Prop({ required: false, type: String, default: null })
  profilePictureUrl: string | null;

  @Prop({ required: false, type: String, default: null })
  resumeUrl: string | null;

  @Prop({ type: [SocialLinkSchema], required: true, default: [] })
  socialLinks: SocialLinkSchema[];
}

export const ProfileMongooseSchema =
  SchemaFactory.createForClass(ProfileSchema);
export type ProfileDocument = ProfileSchema & Document;
