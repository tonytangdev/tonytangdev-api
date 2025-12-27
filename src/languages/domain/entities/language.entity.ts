import { LanguageProficiency } from '../value-objects/language-proficiency.vo';

export interface LanguageProps {
  id: string;
  name: string;
  proficiency: LanguageProficiency;
  isNative: boolean;
  isHighlighted: boolean;
  order: number;
}

export class Language {
  public readonly id: string;
  public readonly name: string;
  public readonly proficiency: LanguageProficiency;
  public readonly isNative: boolean;
  public readonly isHighlighted: boolean;
  public readonly order: number;

  constructor(props: LanguageProps) {
    this.id = props.id;
    this.name = props.name;
    this.proficiency = props.proficiency;
    this.isNative = props.isNative;
    this.isHighlighted = props.isHighlighted;
    this.order = props.order;
  }
}
