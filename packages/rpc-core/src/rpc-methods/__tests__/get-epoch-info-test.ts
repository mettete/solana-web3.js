import { createHttpTransport, createJsonRpc, type Rpc, type SolanaJsonRpcErrorCode } from '@solana/rpc-transport';
import { Commitment } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, GetEpochInfoApi } from '../index';

describe('getEpochInfo', () => {
    let rpc: Rpc<GetEpochInfoApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<GetEpochInfoApi>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns epoch info', async () => {
                expect.assertions(1);
                const epochInfoPromise = rpc.getEpochInfo().send();
                await expect(epochInfoPromise).resolves.toStrictEqual({
                    absoluteSlot: expect.any(BigInt),
                    blockHeight: expect.any(BigInt),
                    epoch: expect.any(BigInt),
                    slotIndex: expect.any(BigInt),
                    slotsInEpoch: expect.any(BigInt),
                    transactionCount: expect.any(BigInt),
                });
            });
        });
    });

    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            const epochInfoPromise = rpc
                .getEpochInfo({
                    minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                })
                .send();
            await expect(epochInfoPromise).rejects.toMatchObject({
                code: -32016 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED'],
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });
});
