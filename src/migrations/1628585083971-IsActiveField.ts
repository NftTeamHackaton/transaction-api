import {MigrationInterface, QueryRunner} from "typeorm";

export class IsActiveField1628585083971 implements MigrationInterface {
    name = 'IsActiveField1628585083971'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stories" ADD "is_active" boolean NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stories" DROP COLUMN "is_active"`);
    }

}
