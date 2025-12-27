import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SocialPlatform } from '../../../../../../domain/value-objects/social-platform.vo';
import { ProfileOrm } from './profile.entity.orm';

@Entity('social_links')
export class SocialLinkOrm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: SocialPlatform,
  })
  platform: SocialPlatform;

  @Column()
  url: string;

  @Column()
  username: string;

  @Column('uuid')
  profileId: string;

  @ManyToOne(() => ProfileOrm, (profile) => profile.socialLinks)
  @JoinColumn({ name: 'profileId' })
  profile: ProfileOrm;
}
