import {MigrationInterface, QueryRunner} from "typeorm";

export class Erc20TransactionTableUpdated1625753827196 implements MigrationInterface {
    name = 'Erc20TransactionTableUpdated1625753827196'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "erc_20_transactions" ADD CONSTRAINT "UQ_954de6cf2da1000ee88ce0c6274" UNIQUE ("hash")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "erc_20_transactions" DROP CONSTRAINT "UQ_954de6cf2da1000ee88ce0c6274"`);
    }

}
