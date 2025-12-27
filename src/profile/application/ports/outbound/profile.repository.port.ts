import { Profile } from '../../../domain/entities/profile.entity';

export abstract class ProfileRepositoryPort {
  abstract findProfile(): Promise<Profile | null>;
}
