import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('solana_transactions')
export class SolanaTransactionEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255, nullable: false })
    blockTime: string;

    @Column({ type: 'timestamp', nullable: false })
    transactionDate: Date;

    @Column({ length: 255, nullable: false, unique: false })
    signature: string;

    @Column({ nullable: false })
    fee: number;

    @Column({ length: 255, nullable: false })
    from: string;

    @Column({ length: 255, nullable: false })
    mint: string;

    @Column({ length: 255, nullable: false })
    to: string;

    @Column({ length: 255, nullable: false })
    value: string;

    @Column({ length: 255, nullable: false })
    tokenName: string;

    @Column({ length: 255, nullable: false })
    tokenSymbol: string;

    @Column({ nullable: false })
    tokenDecimals: number;

    @Column({ length: 255, nullable: false })
    network: string;

    @Column({ length: 255, nullable: false })
    operation: string;

    @Column({ length: 255, nullable: true })
    service: string;

    @Column({ length: 255, nullable: true })
    pair: string;
}