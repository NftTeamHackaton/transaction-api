import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('transactions')
export class Transactions {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255, nullable: false })
    hash: string;

    @Column({ type: 'varchar', nullable: false })
    status: string;

    @Column({ type: 'varchar', nullable: false })
    nonce: string;

    @Column({ type: 'text', nullable: true })
    dataHash: string;

    @Column({ type: 'text', nullable: true })
    resourseID: string;

    
}