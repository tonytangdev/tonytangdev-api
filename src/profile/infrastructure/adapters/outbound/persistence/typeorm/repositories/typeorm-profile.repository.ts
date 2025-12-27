import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileRepositoryPort } from '../../../../../../application/ports/outbound/profile.repository.port';
import { Profile } from '../../../../../../domain/entities/profile.entity';
import { SocialLink } from '../../../../../../domain/entities/social-link.entity';
import { ProfileOrm } from '../entities/profile.entity.orm';

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
