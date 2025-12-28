export interface DeleteRefactoringShowcaseInput {
  id: string;
}

export abstract class DeleteRefactoringShowcaseUseCase {
  abstract execute(input: DeleteRefactoringShowcaseInput): Promise<void>;
}
