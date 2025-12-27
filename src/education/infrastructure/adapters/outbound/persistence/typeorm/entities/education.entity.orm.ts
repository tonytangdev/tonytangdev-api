import { Entity, Column, PrimaryColumn } from 'typeorm';
import { DegreeType } from '../../../../../../domain/value-objects/degree-type.vo';
import { EducationStatus } from '../../../../../../domain/value-objects/education-status.vo';

@Entity('education')
export class EducationOrm {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  institution: string;

  @Column({
    type: 'enum',
    enum: DegreeType,
  })
  degreeType: DegreeType;

  @Column()
  fieldOfStudy: string;

  @Column('timestamp')
  startDate: Date;

  @Column('timestamp', { nullable: true })
  endDate: Date | null;

  @Column('text')
  description: string;

  @Column('simple-array')
  achievements: string[];

  @Column()
  location: string;

  @Column({
    type: 'enum',
    enum: EducationStatus,
  })
  status: EducationStatus;

  @Column('boolean')
  isHighlighted: boolean;

  @Column('int')
  order: number;
}
