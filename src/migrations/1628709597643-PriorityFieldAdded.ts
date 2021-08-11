import {MigrationInterface, QueryRunner} from "typeorm";

export class PriorityFieldAdded1628709597643 implements MigrationInterface {
    name = 'PriorityFieldAdded1628709597643'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stories" ADD "priority" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stories" DROP COLUMN "priority"`);
    }

}
