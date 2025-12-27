import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'education' })
export class EducationSchema {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  institution: string;

  @Prop({ required: true })
  degreeType: string;

  @Prop({ required: true })
  fieldOfStudy: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: false, type: Date, default: null })
  endDate: Date | null;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: [String] })
  achievements: string[];

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true, index: true })
  isHighlighted: boolean;

  @Prop({ required: true, index: true })
  order: number;
}

export const EducationMongooseSchema =
  SchemaFactory.createForClass(EducationSchema);
export type EducationDocument = EducationSchema & Document;
