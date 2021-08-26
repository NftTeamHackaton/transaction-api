import {MigrationInterface, QueryRunner} from "typeorm";

export class CryptoTable1629970631659 implements MigrationInterface {
    name = 'CryptoTable1629970631659'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "crypto_lists" ("id" SERIAL NOT NULL, "version" integer NOT NULL, "meta" character varying(255) NOT NULL, CONSTRAINT "PK_bb7c571d4c622753900bdf0ebbc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "crypto_assets" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "website" character varying(255) NOT NULL, "description" character varying(255) NOT NULL, "symbol" character varying(50) NOT NULL, "type" character varying(50) NOT NULL, "logo_uri" character varying(255) NOT NULL, "network" character varying(50) NOT NULL, "explorer" character varying(255) NOT NULL, "decimals" integer NOT NULL, "cryptoListId" integer, CONSTRAINT "PK_a5c31451e9bd1a27f1e578f8f49" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "crypto_assets" ADD CONSTRAINT "FK_a52691f2e1dda573fe6d2b43e6b" FOREIGN KEY ("cryptoListId") REFERENCES "crypto_lists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_assets" DROP CONSTRAINT "FK_a52691f2e1dda573fe6d2b43e6b"`);
        await queryRunner.query(`DROP TABLE "crypto_assets"`);
        await queryRunner.query(`DROP TABLE "crypto_lists"`);
    }

}
