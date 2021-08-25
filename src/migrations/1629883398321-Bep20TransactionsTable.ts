import {MigrationInterface, QueryRunner} from "typeorm";

export class Bep20TransactionsTable1629883398321 implements MigrationInterface {
    name = 'Bep20TransactionsTable1629883398321'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bep_20_transactions" DROP CONSTRAINT "UQ_567335cb2e6f53222df2571af12"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bep_20_transactions" ADD CONSTRAINT "UQ_567335cb2e6f53222df2571af12" UNIQUE ("hash")`);
    }

}
