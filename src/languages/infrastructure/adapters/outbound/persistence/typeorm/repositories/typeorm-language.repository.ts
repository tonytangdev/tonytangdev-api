import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LanguageRepositoryPort } from '../../../../../../application/ports/outbound/language.repository.port';
import { Language } from '../../../../../../domain/entities/language.entity';
import { LanguageOrm } from '../entities/language.entity.orm';

@Injectable()
export class TypeOrmLanguageRepository extends LanguageRepositoryPort {
  constructor(
    @InjectRepository(LanguageOrm)
    private readonly repository: Repository<LanguageOrm>,
  ) {
    super();
  }

  async findAll(): Promise<Language[]> {
    const languages = await this.repository.find({
      order: { order: 'ASC' },
    });
    return languages.map((lang) => this.toDomain(lang));
  }

  async findHighlighted(): Promise<Language[]> {
    const languages = await this.repository.find({
      where: { isHighlighted: true },
      order: { order: 'ASC' },
    });
    return languages.map((lang) => this.toDomain(lang));
  }

  async findNative(): Promise<Language[]> {
    const languages = await this.repository.find({
      where: { isNative: true },
      order: { order: 'ASC' },
    });
    return languages.map((lang) => this.toDomain(lang));
  }

  async create(language: Language): Promise<Language> {
    const orm = this.toOrm(language);
    const saved = await this.repository.save(orm);
    return this.toDomain(saved);
  }

  async findByName(name: string): Promise<Language | null> {
    const language = await this.repository.findOne({ where: { name } });
    return language ? this.toDomain(language) : null;
  }

  async getMaxOrder(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('language')
      .select('MAX(language.order)', 'max')
      .getRawOne<{ max: number | null }>();
    return result?.max ?? 0;
  }

  private toDomain(orm: LanguageOrm): Language {
    return new Language({
      id: orm.id,
      name: orm.name,
      proficiency: orm.proficiency,
      isNative: orm.isNative,
      isHighlighted: orm.isHighlighted,
      order: orm.order,
    });
  }

  private toOrm(language: Language): LanguageOrm {
    const orm = new LanguageOrm();
    orm.id = language.id;
    orm.name = language.name;
    orm.proficiency = language.proficiency;
    orm.isNative = language.isNative;
    orm.isHighlighted = language.isHighlighted;
    orm.order = language.order;
    return orm;
  }
}
