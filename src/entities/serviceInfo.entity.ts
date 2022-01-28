import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('services_info')
export class ServiceInfoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, name: 'name' })
    name: string;

    @Column({ type: 'varchar', length: 255, name: 'symbol' })
    symbol: string;

    @Column({ type: 'varchar', length: 255, name: 'coin_type' })
    type: string;

    @Column({ type: 'varchar', length: 255, name: 'service' })
    service: string;

    @Column({ type: 'varchar', length: 255, name: 'apy' })
    apy: string;

    @Column({ type: 'varchar', length: 255, name: 'category' })
    category: string;
}