import { RefactoringFile } from '../value-objects/refactoring-file.vo';

export interface RefactoringStepProps {
  id: string;
  showcaseId: string;
  title: string;
  description: string;
  explanation: string;
  order: number;
  files: RefactoringFile[];
}

export class RefactoringStep {
  public readonly id: string;
  public readonly showcaseId: string;
  public readonly title: string;
  public readonly description: string;
  public readonly explanation: string;
  public readonly order: number;
  public readonly files: RefactoringFile[];

  constructor(props: RefactoringStepProps) {
    this.id = props.id;
    this.showcaseId = props.showcaseId;
    this.title = props.title;
    this.description = props.description;
    this.explanation = props.explanation;
    this.order = props.order;
    this.files = props.files;
  }
}
