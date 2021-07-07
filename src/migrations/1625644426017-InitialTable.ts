import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialTable1625644426017 implements MigrationInterface {
    name = 'InitialTable1625644426017'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "compounds" ("id" SERIAL NOT NULL, "address" character varying(255) NOT NULL, "staked_balance" numeric NOT NULL, "reward" numeric NOT NULL, "erc_20_token_address" character varying(255) NOT NULL, "c_token_address" character varying NOT NULL, "network" character varying NOT NULL, "staking_date" TIMESTAMP NOT NULL, "reward_date" TIMESTAMP NOT NULL, CONSTRAINT "PK_adbbe9a1cdf9d1bf038d6458449" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "compounds"`);
    }

}
