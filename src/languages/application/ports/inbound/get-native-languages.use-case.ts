import { Language } from '../../../domain/entities/language.entity';

export abstract class GetNativeLanguagesUseCase {
  abstract execute(): Promise<Language[]>;
}
