import {MigrationInterface, QueryRunner} from "typeorm";

export class CryptoContractAddressTable1629977837132 implements MigrationInterface {
    name = 'CryptoContractAddressTable1629977837132'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_assets" ADD "contract_address" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_assets" DROP COLUMN "contract_address"`);
    }

}
