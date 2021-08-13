import {MigrationInterface, QueryRunner} from "typeorm";

export class FeedBackTable1628846078652 implements MigrationInterface {
    name = 'FeedBackTable1628846078652'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "feedbacks" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "title" character varying(255) NOT NULL, "text" text NOT NULL, "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_79affc530fdd838a9f1e0cc30be" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "feedbacks"`);
    }

}
