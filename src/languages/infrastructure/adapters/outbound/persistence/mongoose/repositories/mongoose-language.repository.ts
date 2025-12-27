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
}
