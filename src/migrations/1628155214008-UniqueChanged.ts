import {MigrationInterface, QueryRunner} from "typeorm";

export class UniqueChanged1628155214008 implements MigrationInterface {
    name = 'UniqueChanged1628155214008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "erc_20_transactions" DROP CONSTRAINT "UQ_954de6cf2da1000ee88ce0c6274"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "erc_20_transactions" ADD CONSTRAINT "UQ_954de6cf2da1000ee88ce0c6274" UNIQUE ("hash")`);
    }

}
