import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('files_metadata')
export class FileEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, name: 'hashed_file_name' })
    hashedFileName: string;

    @Column({ type: 'varchar', length: 255, name: 'mime_type' })
    mimeType: string;

    @Column({ type: 'integer', name: 'size'})
    size: number;

    @Column({ type: 'varchar', length: 255, name: 'extension' })
    extension: string;

    @Column({ type: 'varchar', length: 255, name: 'url' })
    url: string;

    @Column({ type: 'varchar', length: 255, name: 'orginial_name' })
    originalName: string;

    @Column({ type: 'integer', name: 'index_number', nullable: true })
    indexNumber: number;
}