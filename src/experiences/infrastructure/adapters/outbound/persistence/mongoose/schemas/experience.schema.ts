import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'experiences' })
export class ExperienceSchema {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  company: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: false, type: Date, default: null })
  endDate: Date | null;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: [String] })
  technologies: string[];

  @Prop({ required: true, type: [String] })
  achievements: string[];

  @Prop({ required: true })
  location: string;

  @Prop({ required: true, index: true })
  isCurrent: boolean;

  @Prop({ required: true, index: true })
  isHighlighted: boolean;

  @Prop({ required: true, index: true })
  order: number;
}

export const ExperienceMongooseSchema =
  SchemaFactory.createForClass(ExperienceSchema);
export type ExperienceDocument = ExperienceSchema & Document;
