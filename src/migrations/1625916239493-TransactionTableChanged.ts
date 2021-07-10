import {MigrationInterface, QueryRunner} from "typeorm";

export class TransactionTableChanged1625916239493 implements MigrationInterface {
    name = 'TransactionTableChanged1625916239493'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "erc_20_transactions" ADD "operation" character varying(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "erc_20_transactions" DROP COLUMN "operation"`);
    }

}
