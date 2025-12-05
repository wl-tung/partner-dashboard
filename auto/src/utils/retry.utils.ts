/**
 * Retry an async operation with exponential backoff
 * @param operation Function to retry
 * @param options Retry configuration
 * @returns Result of the operation
 */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    options: {
        maxAttempts?: number;
        delay?: number;
        onRetry?: (attempt: number, error: Error) => void;
    } = {}
): Promise<T> {
    const { maxAttempts = 3, delay = 1000, onRetry } = options;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxAttempts) {
                throw error;
            }

            if (onRetry) {
                onRetry(attempt, error as Error);
            }

            // Exponential backoff
            const waitTime = delay * attempt;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    throw new Error('Retry operation failed');
}

/**
 * Retry an operation until it succeeds or timeout
 * @param operation Function that returns true on success
 * @param options Retry configuration
 * @returns True if operation succeeded
 */
export async function retryUntil(
    operation: () => Promise<boolean>,
    options: {
        timeout?: number;
        interval?: number;
    } = {}
): Promise<boolean> {
    const { timeout = 10000, interval = 500 } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        if (await operation()) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }

    return false;
}
