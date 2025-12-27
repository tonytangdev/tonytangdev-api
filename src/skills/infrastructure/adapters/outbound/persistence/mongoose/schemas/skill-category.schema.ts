import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'skill_categories' })
export class SkillCategorySchema {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true, index: true })
  order: number;
}

export const SkillCategoryMongooseSchema =
  SchemaFactory.createForClass(SkillCategorySchema);
export type SkillCategoryDocument = SkillCategorySchema & Document;
