import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { CryptoList } from './cryptoList.entity';

@Entity('crypto_assets')
export class CryptoAsset {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'name', type: 'varchar', length: '50' })
    name: string;

    @Column({ name: 'website', type: 'varchar', length: '255' })
    website: string;

    @Column({ name: 'description', type: 'varchar', length: '2000', nullable: true })
    description: string;

    @Column({ name: 'symbol', type: 'varchar', length: '50' })
    symbol: string;

    @Column({ name: 'type', type: 'varchar', length: '50' })
    type: string;

    @Column({ name: 'logo_uri', type: 'varchar', length: '255' })
    logoURI: string;

    @Column({ name: 'network', type: 'varchar', length: '50' })
    network: string;

    @Column({ name: 'explorer', type: 'varchar', length: '255' })
    explorer: string;

    @Column({ name: 'decimals', type: 'integer' })
    decimals: number;

    @Column({ name: 'contract_address', type: 'varchar', length: 255, nullable: true })
    contractAddress: string;

    @ManyToOne(() => CryptoList, list => list.assets)
    cryptoList: CryptoList;
}