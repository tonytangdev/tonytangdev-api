export class SkillCategory {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly order: number,
  ) {}
}
