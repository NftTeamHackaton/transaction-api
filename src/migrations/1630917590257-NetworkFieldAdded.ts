import {MigrationInterface, QueryRunner} from "typeorm";

export class NetworkFieldAdded1630917590257 implements MigrationInterface {
    name = 'NetworkFieldAdded1630917590257'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_lists" ADD "network" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_lists" DROP COLUMN "network"`);
    }

}
