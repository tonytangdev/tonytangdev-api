import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LanguageProficiency } from '../../../../../../domain/value-objects/language-proficiency.vo';

@Schema({ collection: 'languages' })
export class LanguageSchema {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(LanguageProficiency),
  })
  proficiency: LanguageProficiency;

  @Prop({ required: true })
  isNative: boolean;

  @Prop({ required: true, index: true })
  isHighlighted: boolean;

  @Prop({ required: true, index: true })
  order: number;
}

export const LanguageMongooseSchema =
  SchemaFactory.createForClass(LanguageSchema);
export type LanguageDocument = LanguageSchema & Document;
