import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExperienceRepositoryPort } from '../../../../../../application/ports/outbound/experience.repository.port';
import { Experience } from '../../../../../../domain/entities/experience.entity';
import {
  ExperienceSchema,
  ExperienceDocument,
} from '../schemas/experience.schema';

@Injectable()
export class MongooseExperienceRepository extends ExperienceRepositoryPort {
  constructor(
    @InjectModel(ExperienceSchema.name)
    private readonly model: Model<ExperienceDocument>,
  ) {
    super();
  }

  async findAll(): Promise<Experience[]> {
    const docs = await this.model.find().sort({ order: 1 }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findHighlighted(): Promise<Experience[]> {
    const docs = await this.model
      .find({ isHighlighted: true })
      .sort({ order: 1 })
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findCurrent(): Promise<Experience | null> {
    const doc = await this.model.findOne({ isCurrent: true }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  private toDomain(doc: ExperienceDocument): Experience {
    return new Experience({
      id: doc._id,
      company: doc.company,
      title: doc.title,
      startDate: doc.startDate,
      endDate: doc.endDate,
      description: doc.description,
      technologies: doc.technologies,
      achievements: doc.achievements,
      location: doc.location,
      isCurrent: doc.isCurrent,
      isHighlighted: doc.isHighlighted,
      order: doc.order,
    });
  }
}
