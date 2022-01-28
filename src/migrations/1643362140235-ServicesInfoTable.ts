import {MigrationInterface, QueryRunner} from "typeorm";

export class ServicesInfoTable1643362140235 implements MigrationInterface {
    name = 'ServicesInfoTable1643362140235'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "services_info" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "symbol" character varying(255) NOT NULL, "coin_type" character varying(255) NOT NULL, "service" character varying(255) NOT NULL, "apy" character varying(255) NOT NULL, "category" character varying(255) NOT NULL, CONSTRAINT "PK_960263803380da363d46aa89387" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "services_info"`);
    }

}
