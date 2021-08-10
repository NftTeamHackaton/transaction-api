import {MigrationInterface, QueryRunner} from "typeorm";

export class Stories1628581210312 implements MigrationInterface {
    name = 'Stories1628581210312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "files_metadata" ("id" SERIAL NOT NULL, "hashed_file_name" character varying(255) NOT NULL, "mime_type" character varying(255) NOT NULL, "size" integer NOT NULL, "extension" character varying(255) NOT NULL, "url" character varying(255) NOT NULL, "orginial_name" character varying(255) NOT NULL, CONSTRAINT "PK_1840f7ca7d0e2d56a18d2c695e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stories" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "previewId" integer, CONSTRAINT "REL_39f32eefdf60092311279d5e84" UNIQUE ("previewId"), CONSTRAINT "PK_bb6f880b260ed96c452b32a39f0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stories_contents_files_metadata" ("storiesId" integer NOT NULL, "filesMetadataId" integer NOT NULL, CONSTRAINT "PK_58d4a4597684962a5c31f444bd9" PRIMARY KEY ("storiesId", "filesMetadataId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_928a8de5c12f52339b28579159" ON "stories_contents_files_metadata" ("storiesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3e62e70473a7f0a7162745fc7a" ON "stories_contents_files_metadata" ("filesMetadataId") `);
        await queryRunner.query(`ALTER TABLE "stories" ADD CONSTRAINT "FK_39f32eefdf60092311279d5e842" FOREIGN KEY ("previewId") REFERENCES "files_metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stories_contents_files_metadata" ADD CONSTRAINT "FK_928a8de5c12f52339b28579159c" FOREIGN KEY ("storiesId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "stories_contents_files_metadata" ADD CONSTRAINT "FK_3e62e70473a7f0a7162745fc7ad" FOREIGN KEY ("filesMetadataId") REFERENCES "files_metadata"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stories_contents_files_metadata" DROP CONSTRAINT "FK_3e62e70473a7f0a7162745fc7ad"`);
        await queryRunner.query(`ALTER TABLE "stories_contents_files_metadata" DROP CONSTRAINT "FK_928a8de5c12f52339b28579159c"`);
        await queryRunner.query(`ALTER TABLE "stories" DROP CONSTRAINT "FK_39f32eefdf60092311279d5e842"`);
        await queryRunner.query(`DROP INDEX "IDX_3e62e70473a7f0a7162745fc7a"`);
        await queryRunner.query(`DROP INDEX "IDX_928a8de5c12f52339b28579159"`);
        await queryRunner.query(`DROP TABLE "stories_contents_files_metadata"`);
        await queryRunner.query(`DROP TABLE "stories"`);
        await queryRunner.query(`DROP TABLE "files_metadata"`);
    }

}
