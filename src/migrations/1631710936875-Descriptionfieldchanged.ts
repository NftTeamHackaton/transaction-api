import {MigrationInterface, QueryRunner} from "typeorm";

export class Descriptionfieldchanged1631710936875 implements MigrationInterface {
    name = 'Descriptionfieldchanged1631710936875'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_assets" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "crypto_assets" ADD "description" character varying(2000)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_assets" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "crypto_assets" ADD "description" character varying(255) NOT NULL`);
    }

}
