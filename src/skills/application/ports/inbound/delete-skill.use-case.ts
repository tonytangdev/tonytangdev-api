export interface DeleteSkillInput {
  id: string;
}

export abstract class DeleteSkillUseCase {
  abstract execute(input: DeleteSkillInput): Promise<void>;
}
