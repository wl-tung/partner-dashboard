/**
 * Test order data interface
 */
export interface TestOrderData {
    customer: {
        name: string;
        email: string;
        phone?: string;
    };
    sender: {
        postalCode: string;
        prefecture: string;
        city?: string;
        street?: string;
        building?: string;
        name?: string;
        phone?: string;
    };
    delivery?: {
        postalCode?: string;
        prefecture?: string;
        city?: string;
        street?: string;
        building?: string;
        name?: string;
        phone?: string;
    };
    products: Array<{
        index: number;
        quantity: number;
    }>;
    payment?: {
        invoiceEmail?: string;
        contractNumber?: string;
    };
}

/**
 * Factory for creating test order data
 * Provides default values and allows overrides
 */
export class OrderDataFactory {
    /**
     * Create a test order with default values
     * @param overrides Partial data to override defaults
     * @returns Complete test order data
     */
    static createTestOrder(overrides?: Partial<TestOrderData>): TestOrderData {
        return {
            customer: {
                name: '検証真鳥',
                email: 'm-matori+itfor_rank_silver@web-life.co.jp',
                phone: '03-1234-5678',
                ...overrides?.customer,
            },
            sender: {
                postalCode: '1000001',
                prefecture: '東京都',
                city: '千代田区',
                street: '千代田1-1',
                name: 'テスト 太郎',
                phone: '03-1234-5678',
                ...overrides?.sender,
            },
            delivery: overrides?.delivery,
            products: overrides?.products || [
                { index: 0, quantity: 1 },
            ],
            payment: {
                invoiceEmail: 'test@example.com',
                ...overrides?.payment,
            },
        };
    }

    /**
     * Create a minimal test order (only required fields)
     */
    static createMinimalOrder(): TestOrderData {
        return {
            customer: {
                name: '検証真鳥',
                email: 'm-matori+itfor_rank_silver@web-life.co.jp',
            },
            sender: {
                postalCode: '1000001',
                prefecture: '東京都',
            },
            products: [
                { index: 0, quantity: 1 },
            ],
        };
    }

    /**
     * Create a test order with multiple products
     */
    static createMultiProductOrder(productCount: number = 3): TestOrderData {
        const products = Array.from({ length: productCount }, (_, i) => ({
            index: i,
            quantity: 1,
        }));

        return this.createTestOrder({ products });
    }
}
