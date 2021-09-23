import {MigrationInterface, QueryRunner} from "typeorm";

export class TypeAddedToCryptoList1632379843842 implements MigrationInterface {
    name = 'TypeAddedToCryptoList1632379843842'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_lists" ADD "type" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_lists" DROP COLUMN "type"`);
    }

}
