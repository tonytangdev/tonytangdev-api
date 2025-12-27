import { Entity, Column, PrimaryColumn } from 'typeorm';
import { LanguageProficiency } from '../../../../../../domain/value-objects/language-proficiency.vo';

@Entity('languages')
export class LanguageOrm {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: LanguageProficiency,
  })
  proficiency: LanguageProficiency;

  @Column('boolean')
  isNative: boolean;

  @Column('boolean')
  isHighlighted: boolean;

  @Column('int')
  order: number;
}
