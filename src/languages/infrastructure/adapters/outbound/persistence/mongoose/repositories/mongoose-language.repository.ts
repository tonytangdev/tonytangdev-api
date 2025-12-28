import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LanguageRepositoryPort } from '../../../../../../application/ports/outbound/language.repository.port';
import { Language } from '../../../../../../domain/entities/language.entity';
import { LanguageSchema, LanguageDocument } from '../schemas/language.schema';

@Injectable()
export class MongooseLanguageRepository extends LanguageRepositoryPort {
  constructor(
    @InjectModel(LanguageSchema.name)
    private readonly model: Model<LanguageDocument>,
  ) {
    super();
  }

  async findAll(): Promise<Language[]> {
    const docs = await this.model.find().sort({ order: 1 }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findHighlighted(): Promise<Language[]> {
    const docs = await this.model
      .find({ isHighlighted: true })
      .sort({ order: 1 })
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findNative(): Promise<Language[]> {
    const docs = await this.model
      .find({ isNative: true })
      .sort({ order: 1 })
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async create(language: Language): Promise<Language> {
    const doc = new this.model(this.toDocument(language));
    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async findByName(name: string): Promise<Language | null> {
    const doc = await this.model.findOne({ name }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findById(id: string): Promise<Language | null> {
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

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  private toDomain(doc: LanguageDocument): Language {
    return new Language({
      id: doc._id,
      name: doc.name,
      proficiency: doc.proficiency,
      isNative: doc.isNative,
      isHighlighted: doc.isHighlighted,
      order: doc.order,
    });
  }

  private toDocument(language: Language): Partial<LanguageDocument> {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      _id: language.id as any,
      name: language.name,
      proficiency: language.proficiency,
      isNative: language.isNative,
      isHighlighted: language.isHighlighted,
      order: language.order,
    };
  }
}
