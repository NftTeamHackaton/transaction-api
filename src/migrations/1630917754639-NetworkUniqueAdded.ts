import {MigrationInterface, QueryRunner} from "typeorm";

export class NetworkUniqueAdded1630917754639 implements MigrationInterface {
    name = 'NetworkUniqueAdded1630917754639'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_lists" ADD CONSTRAINT "UQ_440c197f27f4667b64fa1f5377f" UNIQUE ("network")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_lists" DROP CONSTRAINT "UQ_440c197f27f4667b64fa1f5377f"`);
    }

}
