export interface DeleteSkillCategoryInput {
  id: string;
}

export abstract class DeleteSkillCategoryUseCase {
  abstract execute(input: DeleteSkillCategoryInput): Promise<void>;
}
