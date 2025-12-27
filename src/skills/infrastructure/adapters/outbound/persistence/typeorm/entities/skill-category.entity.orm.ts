import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('skill_categories')
export class SkillCategoryOrm {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('int')
  order: number;
}
