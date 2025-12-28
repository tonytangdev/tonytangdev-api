export interface DeleteExperienceInput {
  id: string;
}

export abstract class DeleteExperienceUseCase {
  abstract execute(input: DeleteExperienceInput): Promise<void>;
}
