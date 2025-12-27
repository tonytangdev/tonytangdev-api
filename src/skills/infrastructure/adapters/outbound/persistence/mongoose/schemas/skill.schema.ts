import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ProficiencyLevel } from '../../../../../../domain/value-objects/proficiency-level.vo';

@Schema({ collection: 'skills' })
export class SkillSchema {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, index: true })
  categoryId: string;

  @Prop({ required: true, type: String, enum: Object.values(ProficiencyLevel) })
  proficiency: ProficiencyLevel;

  @Prop({ required: false, type: Number, default: null })
  yearsOfExperience: number | null;

  @Prop({ required: true, index: true })
  order: number;

  @Prop({ required: true, index: true })
  isHighlighted: boolean;
}

export const SkillMongooseSchema = SchemaFactory.createForClass(SkillSchema);
export type SkillDocument = SkillSchema & Document;
