import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DifficultyLevel } from '../../../../../../domain/value-objects/difficulty-level.vo';
import { RefactoringStepSchema } from './refactoring-step.schema';

@Schema({ collection: 'refactoring_showcases' })
export class RefactoringShowcaseSchema {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: [String] })
  technologies: string[];

  @Prop({ required: true, type: String, enum: Object.values(DifficultyLevel) })
  difficulty: DifficultyLevel;

  @Prop({ required: true, type: [String] })
  tags: string[];

  @Prop({ required: true, index: true })
  order: number;

  @Prop({ required: true, index: true })
  isHighlighted: boolean;

  @Prop({ required: true, type: [RefactoringStepSchema] })
  steps: RefactoringStepSchema[];
}

export const RefactoringShowcaseMongooseSchema = SchemaFactory.createForClass(
  RefactoringShowcaseSchema,
);
export type RefactoringShowcaseDocument = RefactoringShowcaseSchema & Document;
