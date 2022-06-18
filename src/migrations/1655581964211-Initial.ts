import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1655581964211 implements MigrationInterface {
    name = 'Initial1655581964211'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "hash" character varying(255) NOT NULL, "status" character varying NOT NULL, "nonce" character varying NOT NULL, "dataHash" text, "resourseID" text, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "transactions"`);
    }

}
