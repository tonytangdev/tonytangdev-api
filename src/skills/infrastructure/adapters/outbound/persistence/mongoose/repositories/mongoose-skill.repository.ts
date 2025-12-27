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

  async create(skill: Skill): Promise<Skill> {
    const doc = new this.model(this.toDocument(skill));
    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async findByName(name: string): Promise<Skill | null> {
    const doc = await this.model.findOne({ name }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findById(id: string): Promise<Skill | null> {
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

  private toDocument(skill: Skill): Partial<SkillDocument> {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      _id: skill.id as any,
      name: skill.name,
      categoryId: skill.categoryId,
      proficiency: skill.proficiency,
      yearsOfExperience: skill.yearsOfExperience,
      order: skill.order,
      isHighlighted: skill.isHighlighted,
    };
  }
}
