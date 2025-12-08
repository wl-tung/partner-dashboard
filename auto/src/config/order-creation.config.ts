/**
 * Configuration for order creation automation
 * Centralized constants for timeouts, retries, and selectors
 */
export const OrderCreationConfig = {
    /**
     * Timeout values in milliseconds
     */
    timeouts: {
        /** Modal open/close timeout */
        modal: 5000,
        /** Button interaction timeout */
        button: 3000,
        /** Page navigation timeout */
        navigation: 10000,
        /** Animation/transition timeout */
        animation: 300,
        /** Form submission timeout */
        formSubmit: 5000,
        /** Network idle timeout */
        networkIdle: 5000,
        /** Search debounce wait */
        searchDebounce: 500,
    },

    /**
     * Retry configuration
     */
    retries: {
        /** Product selection retry attempts */
        productSelection: 5,
        /** Address selection retry attempts */
        addressSelection: 3,
        /** General operation retry attempts */
        general: 3,
    },

    /**
     * Common selectors
     */
    selectors: {
        /** Modal dialog selector */
        modal: '[role="dialog"]',
        /** Submit order button text */
        submitButton: '注文を確定',
        /** Confirm button text */
        confirmButton: '確定する',
        /** Product card selector */
        productCard: '.MuiCard-root',
        /** Close button text patterns */
        closeButton: /閉じる|キャンセル|Close|Cancel/i,
    },

    /**
     * Debug configuration
     */
    debug: {
        /** Enable debug logging */
        enabled: process.env.DEBUG === 'true',
        /** Log all button texts in modals */
        logButtons: process.env.VERBOSE === 'true',
        /** Log modal HTML on errors */
        logModalHtml: process.env.DEBUG === 'true',
    },
} as const;
