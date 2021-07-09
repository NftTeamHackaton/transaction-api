import {MigrationInterface, QueryRunner} from "typeorm";

export class Erc20TransactionTable1625750292623 implements MigrationInterface {
    name = 'Erc20TransactionTable1625750292623'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "erc_20_transactions" ("id" SERIAL NOT NULL, "blockNumber" character varying(255) NOT NULL, "timeStamp" character varying(255) NOT NULL, "transactionDate" TIMESTAMP NOT NULL, "hash" character varying(255) NOT NULL, "nonce" character varying(255) NOT NULL, "blockHash" character varying(255) NOT NULL, "from" character varying(255) NOT NULL, "contractAddress" character varying(255) NOT NULL, "to" character varying(255) NOT NULL, "value" character varying(255) NOT NULL, "tokenName" character varying(255) NOT NULL, "tokenSymbol" character varying(255) NOT NULL, "tokenDecimals" integer NOT NULL, "transactionIndex" character varying(255) NOT NULL, "gas" character varying(255) NOT NULL, "gasPrice" character varying(255) NOT NULL, "gasUsed" character varying(255) NOT NULL, "cumulativeGasUsed" character varying(255) NOT NULL, "input" character varying(255) NOT NULL, "confirmations" character varying(255) NOT NULL, CONSTRAINT "PK_c7eda1d0e5567c2b967d8c5495a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "erc_20_transactions"`);
    }

}
