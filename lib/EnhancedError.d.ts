export default class EnhancedError extends Error {
    private cause;
    constructor(message: string, cause?: Error);
}
