import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { RefactoringShowcaseOrm } from './refactoring-showcase.entity.orm';
import { RefactoringFileOrm } from './refactoring-file.entity.orm';

@Entity('refactoring_steps')
export class RefactoringStepOrm {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  showcaseId: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('text')
  explanation: string;

  @Column('int')
  order: number;

  @ManyToOne(() => RefactoringShowcaseOrm, (showcase) => showcase.steps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'showcaseId' })
  showcase: RefactoringShowcaseOrm;

  @OneToMany(() => RefactoringFileOrm, (file) => file.step, {
    eager: true,
    cascade: true,
  })
  files: RefactoringFileOrm[];
}
