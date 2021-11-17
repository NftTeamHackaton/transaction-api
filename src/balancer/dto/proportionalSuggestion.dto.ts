export class ProportionalSuggestionDto {
    poolId: string;
    amount: string;
    type: 'send' | 'receive';
    index: number;
}