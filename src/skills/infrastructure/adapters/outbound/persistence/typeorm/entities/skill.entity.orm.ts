import { Entity, Column, PrimaryColumn } from 'typeorm';
import { ProficiencyLevel } from '../../../../../../domain/value-objects/proficiency-level.vo';

@Entity('skills')
export class SkillOrm {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('uuid')
  categoryId: string;

  @Column({
    type: 'enum',
    enum: ProficiencyLevel,
  })
  proficiency: ProficiencyLevel;

  @Column('int', { nullable: true })
  yearsOfExperience: number | null;

  @Column('int')
  order: number;

  @Column('boolean')
  isHighlighted: boolean;
}
