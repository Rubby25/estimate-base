import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure user can register an asset",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;

        const assetId = "test-asset-001";
        const block = chain.mineBlock([
            Tx.contractCall('estimate-base', 'register-asset', [
                types.ascii(assetId),
                types.utf8("Test Digital Asset"),
                types.ascii("Technology"),
                types.uint(1672531200),
                types.uint(10000),
                types.uint(12500),
                types.none(),
                types.bool(false)
            ], wallet1.address)
        ]);

        assertEquals(block.receipts.length, 1);
        block.receipts[0].result.expectOk().expectAscii(assetId);
    }
});

Clarinet.test({
    name: "Prevent asset registration with duplicate ID",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        const assetId = "duplicate-asset";
        const block = chain.mineBlock([
            Tx.contractCall('estimate-base', 'register-asset', [
                types.ascii(assetId),
                types.utf8("First Asset"),
                types.ascii("Technology"),
                types.uint(1672531200),
                types.uint(10000),
                types.uint(12500),
                types.none(),
                types.bool(false)
            ], wallet1.address),
            Tx.contractCall('estimate-base', 'register-asset', [
                types.ascii(assetId),
                types.utf8("Second Asset"),
                types.ascii("Technology"),
                types.uint(1672531200),
                types.uint(10000),
                types.uint(12500),
                types.none(),
                types.bool(false)
            ], wallet1.address)
        ]);

        assertEquals(block.receipts.length, 2);
        block.receipts[0].result.expectOk().expectAscii(assetId);
        block.receipts[1].result.expectErr().expectUint(102); // ERR-ASSET-EXISTS
    }
});