import {MigrationInterface, QueryRunner} from "typeorm";

export class IndexFieldAdded1629368705004 implements MigrationInterface {
    name = 'IndexFieldAdded1629368705004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "files_metadata" ADD "index_number" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "files_metadata" DROP COLUMN "index_number"`);
    }

}
