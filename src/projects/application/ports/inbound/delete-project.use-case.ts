export interface DeleteProjectInput {
  id: string;
}

export abstract class DeleteProjectUseCase {
  abstract execute(input: DeleteProjectInput): Promise<void>;
}
