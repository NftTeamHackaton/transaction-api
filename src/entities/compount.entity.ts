import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('compounds')
export class Compound {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'address', length: 255, nullable: false })
    address: string;

    @Column({ name: 'staked_balance', type: 'numeric', nullable: false })
    stakedBalance: number;

    @Column({ name: 'reward', type: 'numeric', nullable: false })
    reward: number;

    @Column({ name: 'erc_20_token_address', length: 255, nullable: false })
    erc20TokenAddress: string;

    @Column({ name: 'c_token_address', nullable: false })
    cTokenAddress: string;

    @Column({ name: 'network', nullable: false })
    network: string;

    @Column({ name: 'staking_date', type: 'timestamp', nullable: false })
    stakingDate: Date;

    @Column({ name: 'reward_date', type: 'timestamp', nullable: false })
    rewardDate: Date;
}