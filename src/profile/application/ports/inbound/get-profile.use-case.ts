import { Profile } from '../../../domain/entities/profile.entity';

export abstract class GetProfileUseCase {
  abstract execute(): Promise<Profile | null>;
}
