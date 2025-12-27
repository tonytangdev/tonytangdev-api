import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class RefactoringFileSchema {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  language: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  order: number;
}

export const RefactoringFileMongooseSchema = SchemaFactory.createForClass(
  RefactoringFileSchema,
);
export type RefactoringFileDocument = RefactoringFileSchema & Document;
