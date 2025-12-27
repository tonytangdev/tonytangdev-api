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
}
