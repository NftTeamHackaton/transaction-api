import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { FileEntity } from './file.entity';

@Entity('stories')
export class StoriesEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, name: 'name' })
    name: string;

    @Column({ type: 'bool', name: 'is_active' })
    isActive: boolean;

    @OneToOne(() => FileEntity)
    @JoinColumn()
    preview: FileEntity;

    @ManyToMany(() => FileEntity)
    @JoinTable()
    contents: FileEntity[];
}