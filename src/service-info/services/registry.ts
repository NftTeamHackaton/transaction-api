import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { AaveService } from "./aave/aave.service";
import { CompoundService } from "./compound/compound.service";
import { ServiceInterface } from "./service.interface";

@Injectable()
export class Registry {
    constructor(
        private readonly compoundService: CompoundService,
        private readonly aaveService: AaveService
    ) {}

    public async getAPYByService(network: string, service: string): Promise<ServiceInterface[]> {
        switch (service) {
            case 'aave': {
                return this.aaveService.getAPY(network)
            }
            case 'compound': {
                return this.compoundService.getAPY(network)
            }
            default: {
                throw new InternalServerErrorException("Service not found")
            }
        }
    }

    public getServices() {
        return ['aave', 'compound']
    }
}