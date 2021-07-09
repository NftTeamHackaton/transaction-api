import {MigrationInterface, QueryRunner} from "typeorm";

export class Erc20TransactionTableUpdated1625754138318 implements MigrationInterface {
    name = 'Erc20TransactionTableUpdated1625754138318'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "erc_20_transactions" DROP COLUMN "nonce"`);
        await queryRunner.query(`ALTER TABLE "erc_20_transactions" ADD "nonce" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "erc_20_transactions" DROP COLUMN "nonce"`);
        await queryRunner.query(`ALTER TABLE "erc_20_transactions" ADD "nonce" character varying(255) NOT NULL`);
    }

}
