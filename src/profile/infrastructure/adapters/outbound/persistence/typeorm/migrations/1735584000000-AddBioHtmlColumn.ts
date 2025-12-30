import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddBioHtmlColumn1735584000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'profiles',
      new TableColumn({
        name: 'bioHtml',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.query(`
      UPDATE profiles
      SET "bioHtml" = "bio"
      WHERE "bioHtml" IS NULL
    `);

    await queryRunner.changeColumn(
      'profiles',
      'bioHtml',
      new TableColumn({
        name: 'bioHtml',
        type: 'text',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('profiles', 'bioHtml');
  }
}
