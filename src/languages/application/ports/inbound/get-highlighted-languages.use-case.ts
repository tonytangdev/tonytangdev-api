import { Language } from '../../../domain/entities/language.entity';

export abstract class GetHighlightedLanguagesUseCase {
  abstract execute(): Promise<Language[]>;
}
