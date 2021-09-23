import {MigrationInterface, QueryRunner} from "typeorm";

export class UniqueDeleteForCryptoList1632383127866 implements MigrationInterface {
    name = 'UniqueDeleteForCryptoList1632383127866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_lists" DROP CONSTRAINT "UQ_440c197f27f4667b64fa1f5377f"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_lists" ADD CONSTRAINT "UQ_440c197f27f4667b64fa1f5377f" UNIQUE ("network")`);
    }

}
