export const BalancesABI: any = [
    {
        "inputs": [
            {
                "internalType": "address[]",
                "name": "_tokens",
                "type": "address[]"
            },
            {
                "internalType": "address",
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "getBalances",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "balance",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct Balances.FullBalance[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]