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

  async create(profile: Profile): Promise<Profile> {
    const doc = await this.model.create({
      _id: profile.id,
      fullName: profile.fullName,
      title: profile.title,
      bio: profile.bio,
      bioHtml: profile.bioHtml,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      timezone: profile.timezone,
      availability: profile.availability,
      yearsOfExperience: profile.yearsOfExperience,
      profilePictureUrl: profile.profilePictureUrl,
      resumeUrl: profile.resumeUrl,
      socialLinks: profile.socialLinks.map((link) => ({
        platform: link.platform,
        url: link.url,
        username: link.username,
      })),
    });
    return this.toDomain(doc);
  }

  async update(profile: Profile): Promise<Profile> {
    const doc = await this.model
      .findByIdAndUpdate(
        profile.id,
        {
          fullName: profile.fullName,
          title: profile.title,
          bio: profile.bio,
          bioHtml: profile.bioHtml,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          timezone: profile.timezone,
          availability: profile.availability,
          yearsOfExperience: profile.yearsOfExperience,
          profilePictureUrl: profile.profilePictureUrl,
          resumeUrl: profile.resumeUrl,
          socialLinks: profile.socialLinks.map((link) => ({
            platform: link.platform,
            url: link.url,
            username: link.username,
          })),
        },
        { new: true },
      )
      .exec();

    if (!doc) {
      throw new Error('Profile not found');
    }

    return this.toDomain(doc);
  }

  private toDomain(doc: ProfileDocument): Profile {
    return new Profile({
      id: doc._id,
      fullName: doc.fullName,
      title: doc.title,
      bio: doc.bio,
      bioHtml: doc.bioHtml,
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
