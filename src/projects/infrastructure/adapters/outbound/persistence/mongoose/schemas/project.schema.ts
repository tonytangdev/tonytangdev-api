import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'projects' })
export class ProjectSchema {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: false, type: Date, default: null })
  endDate: Date | null;

  @Prop({ required: true, type: [String] })
  technologies: string[];

  @Prop({ required: false, type: String, default: null })
  repositoryLink: string | null;

  @Prop({ required: false, type: String, default: null })
  demoLink: string | null;

  @Prop({ required: false, type: String, default: null })
  websiteLink: string | null;

  @Prop({ required: true, type: [String] })
  achievements: string[];

  @Prop({ required: true, index: true })
  order: number;

  @Prop({ required: true, index: true })
  isHighlighted: boolean;
}

export const ProjectMongooseSchema =
  SchemaFactory.createForClass(ProjectSchema);
export type ProjectDocument = ProjectSchema & Document;
