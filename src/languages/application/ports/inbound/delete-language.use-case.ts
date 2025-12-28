export interface DeleteLanguageInput {
  id: string;
}

export abstract class DeleteLanguageUseCase {
  abstract execute(input: DeleteLanguageInput): Promise<void>;
}
