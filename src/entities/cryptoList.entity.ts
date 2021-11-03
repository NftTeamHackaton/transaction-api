import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { CryptoAsset } from './cryptoAsset.entity';

@Entity('crypto_lists')
export class CryptoList {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'version', type: 'integer' })
    version: number;

    @Column({ name: 'meta', type: 'varchar', length: 255 })
    meta: string;

    @Column({ name: 'network', type: 'varchar', length: 255, nullable: true, unique: false })
    network: string;

    @Column({ name: 'type', type: 'varchar', length: 255, nullable: true })
    type: string;

    @ManyToMany(() => CryptoAsset, asset => asset.cryptoList)
    @JoinTable()
    assets: CryptoAsset[];
}