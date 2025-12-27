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

  private toDomain(doc: SkillCategoryDocument): SkillCategory {
    return new SkillCategory({
      id: doc._id,
      name: doc.name,
      slug: doc.slug,
      order: doc.order,
    });
  }
}
