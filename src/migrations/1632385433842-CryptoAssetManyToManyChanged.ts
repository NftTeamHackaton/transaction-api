import {MigrationInterface, QueryRunner} from "typeorm";

export class CryptoAssetManyToManyChanged1632385433842 implements MigrationInterface {
    name = 'CryptoAssetManyToManyChanged1632385433842'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_assets" DROP CONSTRAINT "FK_a52691f2e1dda573fe6d2b43e6b"`);
        await queryRunner.query(`ALTER TABLE "crypto_assets" DROP COLUMN "cryptoListId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_assets" ADD "cryptoListId" integer`);
        await queryRunner.query(`ALTER TABLE "crypto_assets" ADD CONSTRAINT "FK_a52691f2e1dda573fe6d2b43e6b" FOREIGN KEY ("cryptoListId") REFERENCES "crypto_lists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
