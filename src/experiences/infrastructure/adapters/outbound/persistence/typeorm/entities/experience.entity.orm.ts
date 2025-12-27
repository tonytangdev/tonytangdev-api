import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('experiences')
export class ExperienceOrm {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  company: string;

  @Column()
  title: string;

  @Column('timestamp')
  startDate: Date;

  @Column('timestamp', { nullable: true })
  endDate: Date | null;

  @Column('text')
  description: string;

  @Column('simple-array')
  technologies: string[];

  @Column('simple-array')
  achievements: string[];

  @Column()
  location: string;

  @Column('boolean')
  isCurrent: boolean;

  @Column('boolean')
  isHighlighted: boolean;

  @Column('int')
  order: number;
}
