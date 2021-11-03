import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('erc_20_transactions')
export class Erc20TransactionEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255, nullable: false })
    blockNumber: string;

    @Column({ length: 255, nullable: false })
    timeStamp: string;

    @Column({ type: 'timestamp', nullable: false })
    transactionDate: Date;

    @Column({ length: 255, nullable: false, unique: false })
    hash: string;

    @Column({ nullable: false })
    nonce: number;

    @Column({ length: 255, nullable: false })
    blockHash: string;

    @Column({ length: 255, nullable: false })
    from: string;

    @Column({ length: 255, nullable: false })
    contractAddress: string;

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
    transactionIndex: string;

    @Column({ length: 255, nullable: false })
    gas: string;

    @Column({ length: 255, nullable: false })
    gasPrice: string;

    @Column({ length: 255, nullable: false })
    gasUsed: string;

    @Column({ length: 255, nullable: false })
    cumulativeGasUsed: string;

    @Column({ type: 'text', nullable: false })
    input: string;

    @Column({ length: 255, nullable: false })
    confirmations: string;

    @Column({ length: 255, nullable: false })
    network: string;

    @Column({ length: 255, nullable: false })
    operation: string;

    @Column({ length: 255, nullable: true })
    service: string;

    @Column({ length: 255, nullable: true })
    pair: string;
}