import { Language } from '../../../domain/entities/language.entity';

export abstract class GetLanguagesUseCase {
  abstract execute(): Promise<Language[]>;
}
