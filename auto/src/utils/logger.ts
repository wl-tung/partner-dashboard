/**
 * Test logger with conditional logging based on environment
 */
export class TestLogger {
    private static isDebugEnabled(): boolean {
        return process.env.DEBUG === 'true' || process.env.DEBUG_TESTS === 'true';
    }

    private static isVerboseEnabled(): boolean {
        return process.env.VERBOSE === 'true';
    }

    /**
     * Log a message (only in debug mode)
     * @param message Message to log
     * @param data Optional data to log
     */
    static log(message: string, data?: any): void {
        if (this.isDebugEnabled()) {
            if (data !== undefined) {
                console.log(message, data);
            } else {
                console.log(message);
            }
        }
    }

    /**
     * Log button texts (only in verbose mode)
     * @param buttons Array of button texts
     */
    static logButtons(buttons: string[]): void {
        if (this.isVerboseEnabled()) {
            console.log('Buttons found:');
            buttons.forEach((text, i) => console.log(`  ${i}: "${text}"`));
        }
    }

    /**
     * Log an error (always logged)
     * @param message Error message
     * @param error Optional error object
     */
    static error(message: string, error?: Error): void {
        console.error(message);
        if (error && this.isDebugEnabled()) {
            console.error(error);
        }
    }

    /**
     * Log a warning (always logged)
     * @param message Warning message
     */
    static warn(message: string): void {
        console.warn(message);
    }

    /**
     * Log info message (always logged)
     * @param message Info message
     */
    static info(message: string): void {
        console.log(message);
    }
}
