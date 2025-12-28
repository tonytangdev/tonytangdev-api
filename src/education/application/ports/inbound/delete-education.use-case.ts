export interface DeleteEducationInput {
  id: string;
}

export abstract class DeleteEducationUseCase {
  abstract execute(input: DeleteEducationInput): Promise<void>;
}
