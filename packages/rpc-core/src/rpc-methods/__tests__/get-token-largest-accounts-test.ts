import { Address } from '@solana/addresses';
import { createHttpTransport, createJsonRpc, type Rpc, type SolanaJsonRpcErrorCode } from '@solana/rpc-transport';
import { Commitment } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, GetTokenLargestAccountsApi } from '../index';

const CONTEXT_MATCHER = expect.objectContaining({
    slot: expect.any(BigInt),
});

describe('getTokenLargestAccounts', () => {
    let rpc: Rpc<GetTokenLargestAccountsApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<GetTokenLargestAccountsApi>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            // TODO: will need a way to create token mint + accounts in tests
            it('returns the 20 largest token accounts', async () => {
                expect.assertions(1);
                // See scripts/fixtures/spl-token-mint-account.json
                const pubkey =
                    'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' as Address<'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'>;
                const tokenAccountBalancePromise = rpc.getTokenLargestAccounts(pubkey, { commitment }).send();
                await expect(tokenAccountBalancePromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: [
                        {
                            address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
                            amount: '9999999779500000',
                            decimals: 6,
                            // This can be Number or null, but we're using a fixture so it should be Number
                            uiAmount: 9999999779.5,
                            uiAmountString: '9999999779.5',
                        },
                    ],
                });
            });
        });
    });

    describe('when called with an account that is not a token mint', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            const stakeActivationPromise = rpc
                .getTokenSupply(
                    // Randomly generated
                    'BnWCFuxmi6uH3ceVx4R8qcbWBMPVVYVVFWtAiiTA1PAu' as Address,
                )
                .send();
            await expect(stakeActivationPromise).rejects.toMatchObject({
                code: -32602 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_INVALID_PARAMS'],
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });
});
