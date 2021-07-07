import {MigrationInterface, QueryRunner} from "typeorm";

export class AaveInvestTable1625660749327 implements MigrationInterface {
    name = 'AaveInvestTable1625660749327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "aave_invests" ("id" SERIAL NOT NULL, "address" character varying(255) NOT NULL, "staked_balance" numeric NOT NULL, "reward" numeric NOT NULL, "erc_20_token_address" character varying(255) NOT NULL, "a_token_address" character varying NOT NULL, "network" character varying NOT NULL, "staking_date" TIMESTAMP NOT NULL, "reward_date" TIMESTAMP NOT NULL, CONSTRAINT "PK_03eabc511d71c62fd9df1849f40" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "aave_invests"`);
    }

}
