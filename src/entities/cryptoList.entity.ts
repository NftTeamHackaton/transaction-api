import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { CryptoAsset } from './cryptoAsset.entity';

@Entity('crypto_lists')
export class CryptoList {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'version', type: 'integer' })
    version: number;

    @Column({ name: 'meta', type: 'varchar', length: 255 })
    meta: string;

    @Column({ name: 'network', type: 'varchar', length: 255, nullable: true, unique: true })
    network: string;

    @OneToMany(() => CryptoAsset, asset => asset.cryptoList)
    assets: CryptoAsset[];
}