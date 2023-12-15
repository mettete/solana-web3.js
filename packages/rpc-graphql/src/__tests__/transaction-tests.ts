import { Signature } from '@solana/keys';
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
import {
    mockRpcResponse,
    mockTransactionAddressLookup,
    mockTransactionBase58,
    mockTransactionBase64,
    mockTransactionGeneric,
    mockTransactionSystem,
    mockTransactionToken,
    mockTransactionVote,
} from './__setup__';

describe('transaction', () => {
    let rpc: Rpc<GetAccountInfoApi & GetBlockApi & GetProgramAccountsApi & GetTransactionApi>;
    let rpcGraphQL: RpcGraphQL;

    // Random signature for testing.
    // Not actually used. Just needed for proper query parsing.
    const defaultTransactionSignature =
        '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk' as Signature;

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
        it("can query a transaction's slot", async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockTransactionVote)));
            const source = /* GraphQL */ `
                query testQuery {
                    transaction(signature: "${defaultTransactionSignature}") {
                        slot
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        slot: expect.any(BigInt),
                    },
                },
            });
        });
        it("can query a transaction's computeUnitsConsumed from it's meta", async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockTransactionVote)));
            const source = /* GraphQL */ `
                query testQuery {
                    transaction(signature: "${defaultTransactionSignature}") {
                        meta {
                            computeUnitsConsumed
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        meta: {
                            computeUnitsConsumed: expect.any(BigInt),
                        },
                    },
                },
            });
        });
        it("can query several fields from a transaction's meta", async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockTransactionVote)));
            const source = /* GraphQL */ `
                query testQuery {
                    transaction(signature: "${defaultTransactionSignature}") {
                        meta {
                            computeUnitsConsumed
                            fee
                            logMessages
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        meta: {
                            computeUnitsConsumed: expect.any(BigInt),
                            fee: expect.any(BigInt),
                            logMessages: expect.any(Array),
                        },
                    },
                },
            });
        });
    });
    describe('transaction data queries', () => {
        it('can get a transaction as base58', async () => {
            expect.assertions(1);
            // Mock once for requested encoding
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockTransactionBase58)));
            // Mock again for jsonParsed encoding
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockTransactionVote)));
            const source = /* GraphQL */ `
                query testQuery {
                    transaction(signature: "${defaultTransactionSignature}", encoding: BASE_58) {
                        ... on TransactionBase58 {
                            data
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        data: expect.any(String),
                    },
                },
            });
        });
        it('can get a transaction as base64', async () => {
            expect.assertions(1);
            // Mock once for requested encoding
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockTransactionBase64)));
            // Mock again for jsonParsed encoding
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockTransactionVote)));
            const source = /* GraphQL */ `
                query testQuery {
                    transaction(signature: "${defaultTransactionSignature}", encoding: BASE_64) {
                        ... on TransactionBase64 {
                            data
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        data: expect.any(String),
                    },
                },
            });
        });
        it('can get a transaction as jsonParsed', async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockTransactionVote)));
            const source = /* GraphQL */ `
            query testQuery {
                transaction(signature: "${defaultTransactionSignature}", encoding: PARSED) {
                    ... on TransactionParsed {
                        data {
                            message {
                                accountKeys {
                                    pubkey
                                    signer
                                    writable
                                }
                                recentBlockhash
                            }
                            signatures
                        }
                    }
                }
            }
        `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        data: {
                            message: {
                                accountKeys: expect.arrayContaining([
                                    {
                                        pubkey: expect.any(String),
                                        signer: expect.any(Boolean),
                                        writable: expect.any(Boolean),
                                    },
                                ]),
                                recentBlockhash: expect.any(String),
                            },
                            signatures: expect.any(Array),
                        },
                    },
                },
            });
        });
        it('defaults to jsonParsed', async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockTransactionVote)));
            const source = /* GraphQL */ `
            query testQuery {
                transaction(signature: "${defaultTransactionSignature}") {
                    ... on TransactionParsed {
                        data {
                            message {
                                accountKeys {
                                    pubkey
                                    signer
                                    writable
                                }
                                recentBlockhash
                            }
                            signatures
                        }
                    }
                }
            }
        `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        data: {
                            message: {
                                accountKeys: expect.arrayContaining([
                                    {
                                        pubkey: expect.any(String),
                                        signer: expect.any(Boolean),
                                        writable: expect.any(Boolean),
                                    },
                                ]),
                                recentBlockhash: expect.any(String),
                            },
                            signatures: expect.any(Array),
                        },
                    },
                },
            });
        });
    });
    describe('specific transaction instruction queries', () => {
        it('can get a generic instruction', async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockTransactionGeneric)));
            const source = /* GraphQL */ `
                query testQuery {
                    transaction(signature: "${defaultTransactionSignature}") {
                        ... on TransactionParsed {
                            data {
                                message {
                                    instructions {
                                        ... on GenericInstruction {
                                            accounts
                                            data
                                            programId
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        data: {
                            message: {
                                instructions: expect.arrayContaining([
                                    {
                                        accounts: expect.any(Array),
                                        data: expect.any(String),
                                        programId: expect.any(String),
                                    },
                                ]),
                            },
                        },
                    },
                },
            });
        });
        it('can get a `ExtendLookupTable` instruction', async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockTransactionAddressLookup)));
            const source = /* GraphQL */ `
                query testQuery {
                    transaction(signature: "${defaultTransactionSignature}") {
                        ... on TransactionParsed {
                            data {
                                message {
                                    instructions {
                                            programId
                                        ... on ExtendLookupTableInstruction {
                                            lookupTableAccount {
                                                address
                                            }
                                            lookupTableAuthority {
                                                address
                                            }
                                            newAddresses
                                            payerAccount {
                                                address
                                            }
                                            systemProgram {
                                                address
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        data: {
                            message: {
                                instructions: expect.arrayContaining([
                                    {
                                        lookupTableAccount: {
                                            address: expect.any(String),
                                        },
                                        lookupTableAuthority: {
                                            address: expect.any(String),
                                        },
                                        newAddresses: expect.any(Array),
                                        payerAccount: {
                                            address: expect.any(String),
                                        },
                                        programId: 'AddressLookupTab1e1111111111111111111111111',
                                        systemProgram: {
                                            address: expect.any(String),
                                        },
                                    },
                                ]),
                            },
                        },
                    },
                },
            });
        });
        it('can get a `CreateAccount` instruction', async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockTransactionSystem)));
            const source = /* GraphQL */ `
                query testQuery {
                    transaction(signature: "${defaultTransactionSignature}") {
                        ... on TransactionParsed {
                            data {
                                message {
                                    instructions {
                                            programId
                                        ... on CreateAccountInstruction {
                                            lamports
                                            newAccount {
                                                address
                                            }
                                            owner {
                                                address
                                            }
                                            source {
                                                address
                                            }
                                            space
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        data: {
                            message: {
                                instructions: expect.arrayContaining([
                                    {
                                        lamports: expect.any(BigInt),
                                        newAccount: {
                                            address: expect.any(String),
                                        },
                                        owner: {
                                            address: expect.any(String),
                                        },
                                        programId: '11111111111111111111111111111111',
                                        source: {
                                            address: expect.any(String),
                                        },
                                        space: expect.any(BigInt),
                                    },
                                ]),
                            },
                        },
                    },
                },
            });
        });
        it('can get an `Allocate` instruction', async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockTransactionSystem)));
            const source = /* GraphQL */ `
                query testQuery {
                    transaction(signature: "${defaultTransactionSignature}") {
                        ... on TransactionParsed {
                            meta {
                                innerInstructions {
                                    instructions {
                                            programId
                                        ... on AllocateInstruction {
                                            account {
                                                address
                                            }
                                            space
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        meta: {
                            innerInstructions: expect.arrayContaining([
                                {
                                    instructions: expect.arrayContaining([
                                        {
                                            account: {
                                                address: expect.any(String),
                                            },
                                            programId: '11111111111111111111111111111111',
                                            space: expect.any(BigInt),
                                        },
                                    ]),
                                },
                            ]),
                        },
                    },
                },
            });
        });
        it('can get an `Assign` instruction', async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockTransactionSystem)));
            const source = /* GraphQL */ `
                query testQuery {
                    transaction(signature: "${defaultTransactionSignature}") {
                        ... on TransactionParsed {
                            meta {
                                innerInstructions {
                                    instructions {
                                            programId
                                        ... on AssignInstruction {
                                            account {
                                                address
                                            }
                                            owner {
                                                address
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        meta: {
                            innerInstructions: expect.arrayContaining([
                                {
                                    instructions: expect.arrayContaining([
                                        {
                                            account: {
                                                address: expect.any(String),
                                            },
                                            owner: {
                                                address: expect.any(String),
                                            },
                                            programId: '11111111111111111111111111111111',
                                        },
                                    ]),
                                },
                            ]),
                        },
                    },
                },
            });
        });
        it('can get a `Transfer` instruction', async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockTransactionSystem)));
            const source = /* GraphQL */ `
                query testQuery {
                    transaction(signature: "${defaultTransactionSignature}") {
                        ... on TransactionParsed {
                            meta {
                                innerInstructions {
                                    instructions {
                                            programId
                                        ... on TransferInstruction {
                                            destination {
                                                address
                                            }
                                            lamports
                                            source {
                                                address
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        meta: {
                            innerInstructions: expect.arrayContaining([
                                {
                                    instructions: expect.arrayContaining([
                                        {
                                            destination: {
                                                address: expect.any(String),
                                            },
                                            lamports: expect.any(BigInt),
                                            programId: '11111111111111111111111111111111',
                                            source: {
                                                address: expect.any(String),
                                            },
                                        },
                                    ]),
                                },
                            ]),
                        },
                    },
                },
            });
        });
        it('can get a `InitializeMint` instruction', async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockTransactionToken)));
            const source = /* GraphQL */ `
                query testQuery {
                    transaction(signature: "${defaultTransactionSignature}") {
                        ... on TransactionParsed {
                            data {
                                message {
                                    instructions {
                                            programId
                                        ... on SplTokenInitializeMintInstruction {
                                            decimals
                                            freezeAuthority {
                                                address
                                            }
                                            mint {
                                                address
                                            }
                                            mintAuthority {
                                                address
                                            }
                                            rentSysvar
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        data: {
                            message: {
                                instructions: expect.arrayContaining([
                                    {
                                        decimals: expect.any(BigInt),
                                        freezeAuthority: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        mintAuthority: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                        rentSysvar: expect.any(String),
                                    },
                                ]),
                            },
                        },
                    },
                },
            });
        });
        it('can get a `SplTokenTransfer` instruction', async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockTransactionToken)));
            const source = /* GraphQL */ `
                query testQuery {
                    transaction(signature: "${defaultTransactionSignature}") {
                        ... on TransactionParsed {
                            meta {
                                innerInstructions {
                                    instructions {
                                            programId
                                        ... on SplTokenTransferInstruction {
                                            amount
                                            destination {
                                                address
                                            }
                                            source {
                                                address
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        meta: {
                            innerInstructions: expect.arrayContaining([
                                {
                                    instructions: expect.arrayContaining([
                                        {
                                            amount: expect.any(String),
                                            destination: {
                                                address: expect.any(String),
                                            },
                                            programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                            source: {
                                                address: expect.any(String),
                                            },
                                        },
                                    ]),
                                },
                            ]),
                        },
                    },
                },
            });
        });
    });
    describe('cache tests', () => {
        // Not required yet since transactions are not supported as nested queries.
        it.todo('coalesces multiple requests for the same transaction into one');
    });
});
