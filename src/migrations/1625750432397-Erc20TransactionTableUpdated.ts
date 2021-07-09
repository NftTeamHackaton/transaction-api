import {MigrationInterface, QueryRunner} from "typeorm";

export class Erc20TransactionTableUpdated1625750432397 implements MigrationInterface {
    name = 'Erc20TransactionTableUpdated1625750432397'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "erc_20_transactions" ADD "network" character varying(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "erc_20_transactions" DROP COLUMN "network"`);
    }

}
