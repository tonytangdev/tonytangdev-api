import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { DifficultyLevel } from '../../../../../../domain/value-objects/difficulty-level.vo';
import { RefactoringStepOrm } from './refactoring-step.entity.orm';

@Entity('refactoring_showcases')
export class RefactoringShowcaseOrm {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('simple-array')
  technologies: string[];

  @Column({
    type: 'enum',
    enum: DifficultyLevel,
  })
  difficulty: DifficultyLevel;

  @Column('simple-array')
  tags: string[];

  @Column('int')
  order: number;

  @Column('boolean')
  isHighlighted: boolean;

  @OneToMany(() => RefactoringStepOrm, (step) => step.showcase, {
    eager: true,
    cascade: true,
  })
  steps: RefactoringStepOrm[];
}
