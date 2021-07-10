import {MigrationInterface, QueryRunner} from "typeorm";

export class TransactionTableChanged1625915530742 implements MigrationInterface {
    name = 'TransactionTableChanged1625915530742'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "erc_20_transactions" DROP COLUMN "input"`);
        await queryRunner.query(`ALTER TABLE "erc_20_transactions" ADD "input" text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "erc_20_transactions" DROP COLUMN "input"`);
        await queryRunner.query(`ALTER TABLE "erc_20_transactions" ADD "input" character varying(255) NOT NULL`);
    }

}
