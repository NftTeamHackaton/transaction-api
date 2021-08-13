import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('feedbacks')
export class FeedBack {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255})
    name: string;

    @Column({ type: 'varchar', length: 255})
    email: string;

    @Column({ type: 'varchar', length: 255})
    title: string;

    @Column({ type: 'text' })
    text: string;

    @Column({ type: 'timestamp' })
    createdAt: Date;
}