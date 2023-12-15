import {
    createSolanaRpcApi,
    GetAccountInfoApi,
    GetBlockApi,
    GetProgramAccountsApi,
    GetTransactionApi,
} from '@solana/rpc-core';
import { createHttpTransport, createJsonRpc, type Rpc } from '@solana/rpc-transport';
import fetchMock from 'jest-fetch-mock-fork';

import { createRpcGraphQL, RpcGraphQL } from '../rpc';

describe('account', () => {
    let rpc: Rpc<GetAccountInfoApi & GetBlockApi & GetProgramAccountsApi & GetTransactionApi>;
    let rpcGraphQL: RpcGraphQL;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<GetAccountInfoApi & GetBlockApi & GetProgramAccountsApi & GetTransactionApi>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
        rpcGraphQL = createRpcGraphQL(rpc);
    });

    describe('basic queries', () => {
        // See scripts/fixtures/spl-token-token-account.json
        const variableValues = {
            address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
        };
        it("can query an account's lamports balance", async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: String!) {
                    account(address: $address) {
                        lamports
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        lamports: 10290815n,
                    },
                },
            });
        });
        it("can query an account's executable value", async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: String!, $commitment: Commitment) {
                    account(address: $address, commitment: $commitment) {
                        executable
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        executable: false,
                    },
                },
            });
        });
        it("can query an account's address", async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: String!, $commitment: Commitment) {
                    account(address: $address, commitment: $commitment) {
                        address
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
                    },
                },
            });
        });
        it('can query multiple fields', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: String!, $commitment: Commitment) {
                    account(address: $address, commitment: $commitment) {
                        executable
                        lamports
                        rentEpoch
                        space
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        executable: false,
                        lamports: 10290815n,
                        rentEpoch: 0n,
                        space: 165n,
                    },
                },
            });
        });
    });
    describe('nested basic queries', () => {
        // See scripts/fixtures/spl-token-token-account.json
        const variableValues = {
            address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
            commitment: 'confirmed',
        };
        it("can perform a nested query for the account's ownerProgram", async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: String!, $commitment: Commitment) {
                    account(address: $address, commitment: $commitment) {
                        ownerProgram {
                            address
                            executable
                            lamports
                            rentEpoch
                            space
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        ownerProgram: {
                            address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            executable: true,
                            lamports: expect.any(BigInt),
                            rentEpoch: expect.any(BigInt),
                            space: 133352n,
                        },
                    },
                },
            });
        });
    });
    describe('double nested basic queries', () => {
        // See scripts/fixtures/spl-token-token-account.json
        const variableValues = {
            address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
            commitment: 'confirmed',
        };
        it("can perform a double nested query for each account's ownerProgram", async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: String!, $commitment: Commitment) {
                    account(address: $address, commitment: $commitment) {
                        ownerProgram {
                            address
                            ownerProgram {
                                address
                                executable
                                lamports
                                rentEpoch
                                space
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        ownerProgram: {
                            address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            ownerProgram: {
                                address: 'BPFLoader2111111111111111111111111111111111',
                                executable: true,
                                lamports: expect.any(BigInt),
                                rentEpoch: expect.any(BigInt),
                                space: 25n,
                            },
                        },
                    },
                },
            });
        });
    });
    describe('triple nested basic queries', () => {
        // See scripts/fixtures/spl-token-token-account.json
        const variableValues = {
            address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
            commitment: 'confirmed',
        };
        it("can perform a triple nested query for each account's ownerProgram", async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: String!) {
                    account(address: $address) {
                        ownerProgram {
                            address
                            ownerProgram {
                                address
                                ownerProgram {
                                    address
                                }
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        ownerProgram: {
                            address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            ownerProgram: {
                                address: 'BPFLoader2111111111111111111111111111111111',
                                ownerProgram: {
                                    address: 'NativeLoader1111111111111111111111111111111',
                                },
                            },
                        },
                    },
                },
            });
        });
    });
    describe('account data queries', () => {
        it('can get account data as base58', async () => {
            expect.assertions(1);
            // See scripts/fixtures/gpa1.json
            const variableValues = {
                address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                encoding: 'BASE_58',
            };
            const source = /* GraphQL */ `
                query testQuery($address: String!, $encoding: AccountEncoding) {
                    account(address: $address, encoding: $encoding) {
                        address
                        ... on AccountBase58 {
                            data
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                        data: '2Uw1bpnsXxu3e',
                    },
                },
            });
        });
        it('can get account data as base64', async () => {
            expect.assertions(1);
            // See scripts/fixtures/gpa1.json
            const variableValues = {
                address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                encoding: 'BASE_64',
            };
            const source = /* GraphQL */ `
                query testQuery($address: String!, $encoding: AccountEncoding) {
                    account(address: $address, encoding: $encoding) {
                        address
                        ... on AccountBase64 {
                            data
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                        data: 'dGVzdCBkYXRh',
                    },
                },
            });
        });
        it('can get account data as base64+zstd', async () => {
            expect.assertions(1);
            // See scripts/fixtures/gpa1.json
            const variableValues = {
                address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                encoding: 'BASE_64_ZSTD',
            };
            const source = /* GraphQL */ `
                query testQuery($address: String!, $encoding: AccountEncoding) {
                    account(address: $address, encoding: $encoding) {
                        address
                        ... on AccountBase64Zstd {
                            data
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                        data: 'KLUv/QBYSQAAdGVzdCBkYXRh',
                    },
                },
            });
        });
        it('can get account data as jsonParsed', async () => {
            expect.assertions(2);
            const source = /* GraphQL */ `
                query testQuery($address: String!) {
                    account(address: $address, encoding: PARSED) {
                        ... on AccountBase64 {
                            data
                        }
                        ... on MintAccount {
                            supply
                        }
                    }
                }
            `;
            const resultParsed = await rpcGraphQL.query(source, {
                // See scripts/fixtures/spl-token-mint-account.json
                address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
            });
            expect(resultParsed).toMatchObject({
                data: {
                    account: {
                        supply: expect.any(String),
                    },
                },
            });
            // Defaults to base64 if can't be parsed
            const resultBase64 = await rpcGraphQL.query(source, {
                // See scripts/fixtures/gpa1.json
                address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
            });
            expect(resultBase64).toMatchObject({
                data: {
                    account: {
                        data: 'dGVzdCBkYXRh',
                    },
                },
            });
        });
        it('defaults to jsonParsed if possible', async () => {
            expect.assertions(1);
            // See scripts/fixtures/spl-token-mint-account.json
            const variableValues = {
                address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
            };
            const source = /* GraphQL */ `
                query testQuery($address: String!) {
                    account(address: $address) {
                        ... on MintAccount {
                            supply
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        supply: expect.any(String),
                    },
                },
            });
        });
    });
    describe('specific account type queries', () => {
        it('can get a nonce account', async () => {
            expect.assertions(1);
            // See scripts/fixtures/nonce-account.json
            const variableValues = {
                address: 'AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU',
            };
            const source = /* GraphQL */ `
                query testQuery($address: String!) {
                    account(address: $address) {
                        address
                        lamports
                        ownerProgram {
                            address
                        }
                        rentEpoch
                        space
                        ... on NonceAccount {
                            authority {
                                address
                            }
                            blockhash
                            feeCalculator {
                                lamportsPerSignature
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU',
                        authority: {
                            address: '3xxDCjN8s6MgNHwdRExRLa6gHmmRTWPnUdzkbKfEgNAe',
                        },
                        blockhash: expect.any(String),
                        feeCalculator: {
                            lamportsPerSignature: expect.any(String),
                        },
                        lamports: expect.any(BigInt),
                        ownerProgram: {
                            address: '11111111111111111111111111111111',
                        },
                        rentEpoch: expect.any(BigInt),
                        space: 80n,
                    },
                },
            });
        });
        it('can get an address lookup table account', async () => {
            expect.assertions(1);
            // See scripts/fixtures/address-lookup-table-account.json
            const variableValues = {
                address: '2JPQuT3dHtPjrdcbUQyrrT4XYRYaWpWfmAJ54SUapg6n',
            };
            const source = /* GraphQL */ `
                query testQuery($address: String!) {
                    account(address: $address) {
                        address
                        lamports
                        ownerProgram {
                            address
                        }
                        rentEpoch
                        space
                        ... on LookupTableAccount {
                            addresses
                            authority {
                                address
                            }
                            deactivationSlot
                            lastExtendedSlot
                            lastExtendedSlotStartIndex
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: '2JPQuT3dHtPjrdcbUQyrrT4XYRYaWpWfmAJ54SUapg6n',
                        addresses: expect.any(Array),
                        authority: {
                            address: '4msgK65vdz5ADUAB3eTQGpF388NuQUAoknLxutUQJd5B',
                        },
                        deactivationSlot: expect.any(String),
                        lamports: expect.any(BigInt),
                        lastExtendedSlot: expect.any(String),
                        lastExtendedSlotStartIndex: expect.any(Number),
                        ownerProgram: {
                            address: 'AddressLookupTab1e1111111111111111111111111',
                        },
                        rentEpoch: expect.any(BigInt),
                        space: 1304n,
                    },
                },
            });
        });
        it('can get a mint account', async () => {
            expect.assertions(1);
            // See scripts/fixtures/spl-token-mint-account.json
            const variableValues = {
                address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
            };
            const source = /* GraphQL */ `
                query testQuery($address: String!) {
                    account(address: $address) {
                        address
                        lamports
                        ownerProgram {
                            address
                        }
                        rentEpoch
                        space
                        ... on MintAccount {
                            decimals
                            isInitialized
                            mintAuthority {
                                address
                                lamports
                            }
                            supply
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                        decimals: 6,
                        isInitialized: true,
                        lamports: expect.any(BigInt),
                        mintAuthority: {
                            address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            lamports: expect.any(BigInt),
                        },
                        ownerProgram: {
                            address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                        },
                        rentEpoch: expect.any(BigInt),
                        space: 82n,
                        supply: expect.any(String),
                    },
                },
            });
        });
        it('can get a token account', async () => {
            expect.assertions(1);
            // See scripts/fixtures/spl-token-token-account.json
            const variableValues = {
                address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
            };
            const source = /* GraphQL */ `
                query testQuery($address: String!) {
                    account(address: $address) {
                        address
                        lamports
                        ownerProgram {
                            address
                        }
                        rentEpoch
                        space
                        ... on TokenAccount {
                            isNative
                            mint {
                                address
                            }
                            owner {
                                address
                            }
                            state
                            tokenAmount {
                                amount
                                decimals
                                uiAmount
                                uiAmountString
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
                        isNative: expect.any(Boolean),
                        lamports: expect.any(BigInt),
                        mint: {
                            address: expect.any(String),
                        },
                        owner: {
                            address: '6UsGbaMgchgj4wiwKKuE1v5URHdcDfEiMSM25QpesKir',
                        },
                        ownerProgram: {
                            address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                        },
                        rentEpoch: expect.any(BigInt),
                        space: 165n,
                        state: expect.any(String),
                        tokenAmount: {
                            amount: expect.any(String),
                            decimals: expect.any(Number),
                            uiAmountString: expect.any(String),
                        },
                    },
                },
            });
        });
        it('can get a stake account', async () => {
            expect.assertions(1);
            // See scripts/fixtures/stake-account.json
            const variableValues = {
                address: 'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN',
            };
            const source = /* GraphQL */ `
                query testQuery($address: String!) {
                    account(address: $address) {
                        address
                        lamports
                        ownerProgram {
                            address
                        }
                        rentEpoch
                        space
                        ... on StakeAccount {
                            meta {
                                authorized {
                                    staker {
                                        address
                                    }
                                    withdrawer {
                                        address
                                    }
                                }
                                lockup {
                                    custodian {
                                        address
                                    }
                                    epoch
                                    unixTimestamp
                                }
                                rentExemptReserve
                            }
                            stake {
                                creditsObserved
                                delegation {
                                    activationEpoch
                                    deactivationEpoch
                                    stake
                                    voter {
                                        address
                                    }
                                }
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN',
                        lamports: expect.any(BigInt),
                        meta: {
                            authorized: {
                                staker: {
                                    address: '3HRNKNXafhr3wE9NSXRpNVdFYt6EVygdqFwqf6WpG57V',
                                },
                                withdrawer: {
                                    address: '3HRNKNXafhr3wE9NSXRpNVdFYt6EVygdqFwqf6WpG57V',
                                },
                            },
                            lockup: {
                                custodian: {
                                    address: '11111111111111111111111111111111',
                                },
                                epoch: expect.any(BigInt),
                                unixTimestamp: expect.any(BigInt),
                            },
                            rentExemptReserve: expect.any(String),
                        },
                        ownerProgram: {
                            address: 'Stake11111111111111111111111111111111111111',
                        },
                        rentEpoch: expect.any(BigInt),
                        space: 200n,
                        stake: {
                            creditsObserved: expect.any(BigInt),
                            delegation: {
                                activationEpoch: expect.any(BigInt),
                                deactivationEpoch: expect.any(BigInt),
                                stake: expect.any(String),
                                voter: {
                                    address: 'CertusDeBmqN8ZawdkxK5kFGMwBXdudvWHYwtNgNhvLu',
                                },
                            },
                        },
                    },
                },
            });
        });
        it('can get a vote account', async () => {
            expect.assertions(1);
            // See scripts/fixtures/vote-account.json
            const variableValues = {
                address: '4QUZQ4c7bZuJ4o4L8tYAEGnePFV27SUFEVmC7BYfsXRp',
            };
            const source = /* GraphQL */ `
                query testQuery($address: String!) {
                    account(address: $address) {
                        address
                        lamports
                        ownerProgram {
                            address
                        }
                        rentEpoch
                        space
                        ... on VoteAccount {
                            authorizedVoters {
                                authorizedVoter {
                                    address
                                }
                                epoch
                            }
                            authorizedWithdrawer {
                                address
                            }
                            commission
                            epochCredits {
                                credits
                                epoch
                                previousCredits
                            }
                            lastTimestamp {
                                slot
                                timestamp
                            }
                            node {
                                address
                            }
                            priorVoters
                            rootSlot
                            votes {
                                confirmationCount
                                slot
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: '4QUZQ4c7bZuJ4o4L8tYAEGnePFV27SUFEVmC7BYfsXRp',
                        authorizedVoters: expect.arrayContaining([
                            {
                                authorizedVoter: {
                                    address: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                                },
                                epoch: expect.any(BigInt),
                            },
                        ]),
                        authorizedWithdrawer: {
                            address: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                        },
                        commission: expect.any(Number),
                        epochCredits: expect.arrayContaining([
                            {
                                credits: expect.any(String),
                                epoch: expect.any(BigInt),
                                previousCredits: expect.any(String),
                            },
                        ]),
                        lamports: expect.any(BigInt),
                        lastTimestamp: {
                            slot: expect.any(BigInt),
                            timestamp: expect.any(BigInt),
                        },
                        node: {
                            address: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                        },
                        ownerProgram: {
                            address: 'Vote111111111111111111111111111111111111111',
                        },
                        priorVoters: expect.any(Array),
                        rentEpoch: expect.any(BigInt),
                        rootSlot: expect.any(BigInt),
                        space: 3731n,
                        votes: expect.arrayContaining([
                            {
                                confirmationCount: expect.any(Number),
                                slot: expect.any(BigInt),
                            },
                        ]),
                    },
                },
            });
        });
    });
    describe('when querying only an address', () => {
        describe('in the first level', () => {
            it('will not call the RPC for only an address', async () => {
                expect.assertions(2);
                const source = `
                query testQuery {
                    account(address: "2JPQuT3dHtPjrdcbUQyrrT4XYRYaWpWfmAJ54SUapg6n") {
                        address
                    }
                }
            `;
                const result = await rpcGraphQL.query(source);
                expect(result).toMatchObject({
                    data: {
                        account: {
                            address: '2JPQuT3dHtPjrdcbUQyrrT4XYRYaWpWfmAJ54SUapg6n',
                        },
                    },
                });
                expect(fetchMock).not.toHaveBeenCalled();
            });
        });
        describe('in the second level', () => {
            it('will not call the RPC for only an address', async () => {
                expect.assertions(2);
                const source = `
                query testQuery {
                    account(address: "CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN") {
                        address
                        ownerProgram {
                            address
                        }
                    }
                }
            `;
                const result = await rpcGraphQL.query(source);
                expect(result).toMatchObject({
                    data: {
                        account: {
                            address: 'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN',
                            ownerProgram: {
                                address: 'Stake11111111111111111111111111111111111111',
                            },
                        },
                    },
                });
                expect(fetchMock).toHaveBeenCalledTimes(1);
            });
        });
        describe('in the third level', () => {
            it('will not call the RPC for only an address', async () => {
                expect.assertions(2);
                const source = `
                query testQuery {
                    account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                        address
                        ownerProgram {
                            address
                            ownerProgram {
                                address
                            }
                        }
                    }
                }
            `;
                const result = await rpcGraphQL.query(source);
                expect(result).toMatchObject({
                    data: {
                        account: {
                            address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
                            ownerProgram: {
                                address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                ownerProgram: {
                                    address: 'BPFLoader2111111111111111111111111111111111',
                                },
                            },
                        },
                    },
                });
                expect(fetchMock).toHaveBeenCalledTimes(2);
            });
        });
    });
    describe('cache tests', () => {
        it('coalesces multiple requests for the same account into one', async () => {
            expect.assertions(2);
            const source = `
                query testQuery {
                    account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                        address
                        ... on MintAccount {
                            mintAuthority {
                                address
                                lamports
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                        mintAuthority: {
                            address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            lamports: expect.any(BigInt),
                        },
                    },
                },
            });
            expect(fetchMock).toHaveBeenCalledTimes(1);
        });
    });
});
