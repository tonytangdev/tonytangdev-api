import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('projects')
export class ProjectOrm {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('timestamp')
  startDate: Date;

  @Column('timestamp', { nullable: true })
  endDate: Date | null;

  @Column('simple-array')
  technologies: string[];

  @Column('text', { nullable: true })
  repositoryLink: string | null;

  @Column('text', { nullable: true })
  demoLink: string | null;

  @Column('text', { nullable: true })
  websiteLink: string | null;

  @Column('simple-array')
  achievements: string[];

  @Column('int')
  order: number;

  @Column('boolean')
  isHighlighted: boolean;
}
