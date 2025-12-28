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

  async findById(id: string): Promise<Experience | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async create(experience: Experience): Promise<Experience> {
    const doc = new this.model({
      _id: experience.id,
      company: experience.company,
      title: experience.title,
      startDate: experience.startDate,
      endDate: experience.endDate,
      description: experience.description,
      technologies: experience.technologies,
      achievements: experience.achievements,
      location: experience.location,
      isCurrent: experience.isCurrent,
      isHighlighted: experience.isHighlighted,
      order: experience.order,
    });
    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async update(experience: Experience): Promise<Experience> {
    const doc = await this.model
      .findByIdAndUpdate(
        experience.id,
        {
          company: experience.company,
          title: experience.title,
          startDate: experience.startDate,
          endDate: experience.endDate,
          description: experience.description,
          technologies: experience.technologies,
          achievements: experience.achievements,
          location: experience.location,
          isCurrent: experience.isCurrent,
          isHighlighted: experience.isHighlighted,
          order: experience.order,
        },
        { new: true },
      )
      .exec();
    if (!doc) {
      throw new Error(`Experience with id ${experience.id} not found`);
    }
    return this.toDomain(doc);
  }

  async findByCompanyAndTitle(
    company: string,
    title: string,
  ): Promise<Experience | null> {
    const doc = await this.model.findOne({ company, title }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByCompanyAndTitleExcludingId(
    company: string,
    title: string,
    excludeId: string,
  ): Promise<Experience | null> {
    const doc = await this.model
      .findOne({ company, title, _id: { $ne: excludeId } })
      .exec();
    return doc ? this.toDomain(doc) : null;
  }

  async getMaxOrder(): Promise<number> {
    const doc = await this.model
      .findOne()
      .sort({ order: -1 })
      .select('order')
      .exec();
    return doc?.order ?? 0;
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
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
