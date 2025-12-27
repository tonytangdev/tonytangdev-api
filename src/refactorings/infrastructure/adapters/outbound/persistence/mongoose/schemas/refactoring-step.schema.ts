import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RefactoringFileSchema } from './refactoring-file.schema';

@Schema({ _id: false })
export class RefactoringStepSchema {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  showcaseId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  explanation: string;

  @Prop({ required: true })
  order: number;

  @Prop({ required: true, type: [RefactoringFileSchema] })
  files: RefactoringFileSchema[];
}

export const RefactoringStepMongooseSchema = SchemaFactory.createForClass(
  RefactoringStepSchema,
);
export type RefactoringStepDocument = RefactoringStepSchema & Document;
