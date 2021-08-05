import {MigrationInterface, QueryRunner} from "typeorm";

export class ServiceFieldAdded1628151333219 implements MigrationInterface {
    name = 'ServiceFieldAdded1628151333219'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bep_20_transactions" ADD "service" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "bep_20_transactions" ADD "pair" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "erc_20_transactions" ADD "service" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "erc_20_transactions" ADD "pair" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "erc_20_transactions" DROP COLUMN "pair"`);
        await queryRunner.query(`ALTER TABLE "erc_20_transactions" DROP COLUMN "service"`);
        await queryRunner.query(`ALTER TABLE "bep_20_transactions" DROP COLUMN "pair"`);
        await queryRunner.query(`ALTER TABLE "bep_20_transactions" DROP COLUMN "service"`);
    }

}
