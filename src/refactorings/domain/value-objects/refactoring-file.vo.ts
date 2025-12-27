export interface RefactoringFileProps {
  filename: string;
  language: string;
  content: string;
  order: number;
}

export class RefactoringFile {
  public readonly filename: string;
  public readonly language: string;
  public readonly content: string;
  public readonly order: number;

  constructor(props: RefactoringFileProps) {
    this.filename = props.filename;
    this.language = props.language;
    this.content = props.content;
    this.order = props.order;
  }
}
