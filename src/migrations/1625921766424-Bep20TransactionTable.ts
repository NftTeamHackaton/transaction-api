import {MigrationInterface, QueryRunner} from "typeorm";

export class Bep20TransactionTable1625921766424 implements MigrationInterface {
    name = 'Bep20TransactionTable1625921766424'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bep_20_transactions" ("id" SERIAL NOT NULL, "blockNumber" character varying(255) NOT NULL, "timeStamp" character varying(255) NOT NULL, "transactionDate" TIMESTAMP NOT NULL, "hash" character varying(255) NOT NULL, "nonce" integer NOT NULL, "blockHash" character varying(255) NOT NULL, "from" character varying(255) NOT NULL, "contractAddress" character varying(255) NOT NULL, "to" character varying(255) NOT NULL, "value" character varying(255) NOT NULL, "tokenName" character varying(255) NOT NULL, "tokenSymbol" character varying(255) NOT NULL, "tokenDecimals" integer NOT NULL, "transactionIndex" character varying(255) NOT NULL, "gas" character varying(255) NOT NULL, "gasPrice" character varying(255) NOT NULL, "gasUsed" character varying(255) NOT NULL, "cumulativeGasUsed" character varying(255) NOT NULL, "input" text NOT NULL, "confirmations" character varying(255) NOT NULL, "network" character varying(255) NOT NULL, "operation" character varying(255) NOT NULL, CONSTRAINT "UQ_567335cb2e6f53222df2571af12" UNIQUE ("hash"), CONSTRAINT "PK_e937a664e3fe73f722be5efe936" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "bep_20_transactions"`);
    }

}
