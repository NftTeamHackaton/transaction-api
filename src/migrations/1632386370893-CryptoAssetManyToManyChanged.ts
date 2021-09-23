import {MigrationInterface, QueryRunner} from "typeorm";

export class CryptoAssetManyToManyChanged1632386370893 implements MigrationInterface {
    name = 'CryptoAssetManyToManyChanged1632386370893'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "crypto_lists_assets_crypto_assets" ("cryptoListsId" integer NOT NULL, "cryptoAssetsId" integer NOT NULL, CONSTRAINT "PK_da71bb5092ed3285cc6b142d4ea" PRIMARY KEY ("cryptoListsId", "cryptoAssetsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_46755b0457fa479f90dfde60a4" ON "crypto_lists_assets_crypto_assets" ("cryptoListsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7506e0dac240220e9a4aea05cb" ON "crypto_lists_assets_crypto_assets" ("cryptoAssetsId") `);
        await queryRunner.query(`ALTER TABLE "crypto_lists_assets_crypto_assets" ADD CONSTRAINT "FK_46755b0457fa479f90dfde60a40" FOREIGN KEY ("cryptoListsId") REFERENCES "crypto_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "crypto_lists_assets_crypto_assets" ADD CONSTRAINT "FK_7506e0dac240220e9a4aea05cbd" FOREIGN KEY ("cryptoAssetsId") REFERENCES "crypto_assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_lists_assets_crypto_assets" DROP CONSTRAINT "FK_7506e0dac240220e9a4aea05cbd"`);
        await queryRunner.query(`ALTER TABLE "crypto_lists_assets_crypto_assets" DROP CONSTRAINT "FK_46755b0457fa479f90dfde60a40"`);
        await queryRunner.query(`DROP INDEX "IDX_7506e0dac240220e9a4aea05cb"`);
        await queryRunner.query(`DROP INDEX "IDX_46755b0457fa479f90dfde60a4"`);
        await queryRunner.query(`DROP TABLE "crypto_lists_assets_crypto_assets"`);
    }

}
