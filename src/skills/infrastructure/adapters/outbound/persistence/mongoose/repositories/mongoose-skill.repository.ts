import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SkillRepositoryPort } from '../../../../../../application/ports/outbound/skill.repository.port';
import { Skill } from '../../../../../../domain/entities/skill.entity';
import { SkillSchema, SkillDocument } from '../schemas/skill.schema';

@Injectable()
export class MongooseSkillRepository extends SkillRepositoryPort {
  constructor(
    @InjectModel(SkillSchema.name)
    private readonly model: Model<SkillDocument>,
  ) {
    super();
  }

  async findAll(): Promise<Skill[]> {
    const docs = await this.model.find().sort({ order: 1 }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByCategory(categoryId: string): Promise<Skill[]> {
    const docs = await this.model
      .find({ categoryId })
      .sort({ order: 1 })
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findHighlighted(): Promise<Skill[]> {
    const docs = await this.model
      .find({ isHighlighted: true })
      .sort({ order: 1 })
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  private toDomain(doc: SkillDocument): Skill {
    return new Skill({
      id: doc._id,
      name: doc.name,
      categoryId: doc.categoryId,
      proficiency: doc.proficiency,
      yearsOfExperience: doc.yearsOfExperience,
      order: doc.order,
      isHighlighted: doc.isHighlighted,
    });
  }
}
