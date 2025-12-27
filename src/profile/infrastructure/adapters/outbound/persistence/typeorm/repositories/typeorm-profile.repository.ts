import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileRepositoryPort } from '../../../../../../application/ports/outbound/profile.repository.port';
import { Profile } from '../../../../../../domain/entities/profile.entity';
import { SocialLink } from '../../../../../../domain/entities/social-link.entity';
import { ProfileOrm } from '../entities/profile.entity.orm';
import { SocialLinkOrm } from '../entities/social-link.entity.orm';

@Injectable()
export class TypeOrmProfileRepository extends ProfileRepositoryPort {
  constructor(
    @InjectRepository(ProfileOrm)
    private readonly repository: Repository<ProfileOrm>,
  ) {
    super();
  }

  async findProfile(): Promise<Profile | null> {
    const profile = await this.repository.findOne({
      where: {},
      relations: ['socialLinks'],
    });
    return profile ? this.toDomain(profile) : null;
  }

  async create(profile: Profile): Promise<Profile> {
    const profileOrm = new ProfileOrm();
    profileOrm.id = profile.id;
    profileOrm.fullName = profile.fullName;
    profileOrm.title = profile.title;
    profileOrm.bio = profile.bio;
    profileOrm.email = profile.email;
    profileOrm.phone = profile.phone;
    profileOrm.location = profile.location;
    profileOrm.timezone = profile.timezone;
    profileOrm.availability = profile.availability;
    profileOrm.yearsOfExperience = profile.yearsOfExperience;
    profileOrm.profilePictureUrl = profile.profilePictureUrl;
    profileOrm.resumeUrl = profile.resumeUrl;

    profileOrm.socialLinks = profile.socialLinks.map((link) => {
      const linkOrm = new SocialLinkOrm();
      linkOrm.platform = link.platform;
      linkOrm.url = link.url;
      linkOrm.username = link.username;
      linkOrm.profileId = profile.id;
      return linkOrm;
    });

    const saved = await this.repository.save(profileOrm);
    return this.toDomain(saved);
  }

  private toDomain(orm: ProfileOrm): Profile {
    return new Profile({
      id: orm.id,
      fullName: orm.fullName,
      title: orm.title,
      bio: orm.bio,
      email: orm.email,
      phone: orm.phone,
      location: orm.location,
      timezone: orm.timezone,
      availability: orm.availability,
      yearsOfExperience: orm.yearsOfExperience,
      profilePictureUrl: orm.profilePictureUrl,
      resumeUrl: orm.resumeUrl,
      socialLinks: orm.socialLinks.map(
        (link) =>
          new SocialLink({
            platform: link.platform,
            url: link.url,
            username: link.username,
          }),
      ),
    });
  }
}
