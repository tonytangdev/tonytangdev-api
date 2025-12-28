import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RefactoringStepOrm } from './refactoring-step.entity.orm';

@Entity('refactoring_files')
export class RefactoringFileOrm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  language: string;

  @Column('text')
  content: string;

  @Column('int')
  order: number;

  @Column('uuid')
  stepId: string;

  @ManyToOne(() => RefactoringStepOrm, (step) => step.files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'stepId' })
  step: RefactoringStepOrm;
}
