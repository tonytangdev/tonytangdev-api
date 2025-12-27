import { DifficultyLevel } from '../value-objects/difficulty-level.vo';
import { RefactoringStep } from './refactoring-step.entity';

export interface RefactoringShowcaseProps {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  difficulty: DifficultyLevel;
  tags: string[];
  order: number;
  isHighlighted: boolean;
  steps: RefactoringStep[];
}

export class RefactoringShowcase {
  public readonly id: string;
  public readonly title: string;
  public readonly description: string;
  public readonly technologies: string[];
  public readonly difficulty: DifficultyLevel;
  public readonly tags: string[];
  public readonly order: number;
  public readonly isHighlighted: boolean;
  public readonly steps: RefactoringStep[];

  constructor(props: RefactoringShowcaseProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.technologies = props.technologies;
    this.difficulty = props.difficulty;
    this.tags = props.tags;
    this.order = props.order;
    this.isHighlighted = props.isHighlighted;
    this.steps = props.steps;
  }
}
