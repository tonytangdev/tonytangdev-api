import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProfileRepositoryPort } from '../../../../../../application/ports/outbound/profile.repository.port';
import { Profile } from '../../../../../../domain/entities/profile.entity';
import { SocialLink } from '../../../../../../domain/entities/social-link.entity';
import { ProfileSchema, ProfileDocument } from '../schemas/profile.schema';

@Injectable()
export class MongooseProfileRepository extends ProfileRepositoryPort {
  constructor(
    @InjectModel(ProfileSchema.name)
    private readonly model: Model<ProfileDocument>,
  ) {
    super();
  }

  async findProfile(): Promise<Profile | null> {
    const doc = await this.model.findOne().exec();
    if (!doc) return null;
    return this.toDomain(doc);
  }

  private toDomain(doc: ProfileDocument): Profile {
    return new Profile({
      id: doc._id,
      fullName: doc.fullName,
      title: doc.title,
      bio: doc.bio,
      email: doc.email,
      phone: doc.phone,
      location: doc.location,
      timezone: doc.timezone,
      availability: doc.availability,
      yearsOfExperience: doc.yearsOfExperience,
      profilePictureUrl: doc.profilePictureUrl,
      resumeUrl: doc.resumeUrl,
      socialLinks: doc.socialLinks.map(
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
