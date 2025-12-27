import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { AvailabilityStatus } from '../../../../../../domain/value-objects/availability-status.vo';
import { SocialLinkOrm } from './social-link.entity.orm';

@Entity('profiles')
export class ProfileOrm {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column()
  title: string;

  @Column('text')
  bio: string;

  @Column()
  email: string;

  @Column('varchar', { nullable: true })
  phone: string | null;

  @Column()
  location: string;

  @Column()
  timezone: string;

  @Column({
    type: 'enum',
    enum: AvailabilityStatus,
  })
  availability: AvailabilityStatus;

  @Column('int')
  yearsOfExperience: number;

  @Column('text', { nullable: true })
  profilePictureUrl: string | null;

  @Column('text', { nullable: true })
  resumeUrl: string | null;

  @OneToMany(() => SocialLinkOrm, (socialLink) => socialLink.profile, {
    eager: true,
    cascade: true,
  })
  socialLinks: SocialLinkOrm[];
}
