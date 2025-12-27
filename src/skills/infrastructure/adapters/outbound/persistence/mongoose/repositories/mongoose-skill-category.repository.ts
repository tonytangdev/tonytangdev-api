import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SkillCategoryRepositoryPort } from '../../../../../../application/ports/outbound/skill-category.repository.port';
import { SkillCategory } from '../../../../../../domain/entities/skill-category.entity';
import {
  SkillCategorySchema,
  SkillCategoryDocument,
} from '../schemas/skill-category.schema';

@Injectable()
export class MongooseSkillCategoryRepository extends SkillCategoryRepositoryPort {
  constructor(
    @InjectModel(SkillCategorySchema.name)
    private readonly model: Model<SkillCategoryDocument>,
  ) {
    super();
  }

  async findAll(): Promise<SkillCategory[]> {
    const docs = await this.model.find().sort({ order: 1 }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findBySlug(slug: string): Promise<SkillCategory | null> {
    const doc = await this.model.findOne({ slug }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async create(category: SkillCategory): Promise<SkillCategory> {
    const doc = new this.model(this.toDocument(category));
    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async findByName(name: string): Promise<SkillCategory | null> {
    const doc = await this.model.findOne({ name }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findById(id: string): Promise<SkillCategory | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async getMaxOrder(): Promise<number> {
    const result = await this.model
      .findOne()
      .sort({ order: -1 })
      .select('order')
      .exec();
    return result?.order ?? 0;
  }

  private toDomain(doc: SkillCategoryDocument): SkillCategory {
    return new SkillCategory({
      id: doc._id,
      name: doc.name,
      slug: doc.slug,
      order: doc.order,
    });
  }

  private toDocument(category: SkillCategory): Partial<SkillCategoryDocument> {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      _id: category.id as any,
      name: category.name,
      slug: category.slug,
      order: category.order,
    };
  }
}
