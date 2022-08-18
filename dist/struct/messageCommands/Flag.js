/**
 * Represents a special return value during command execution or argument parsing.
 */
export default class Flag {
    /**
     * @param type - Type of flag.
     * @param data - Extra data.
     */
    constructor(type, data = {}) {
        this.type = type;
        Object.assign(this, data);
    }
    /**
     * Creates a flag that cancels the command.
     */
    static cancel() {
        return new Flag('cancel');
    }
    /**
     * Creates a flag that retries with another input.
     * @param message - Message to handle.
     */
    static retry(message) {
        return new Flag('retry', { message });
    }
    /**
     * Creates a flag that acts as argument cast failure with extra data.
     * @param value - The extra data for the failure.
     */
    static fail(value) {
        return new Flag('fail', { value });
    }
    /**
     * Creates a flag that runs another command with the rest of the arguments.
     * @param command - MessageCommand ID.
     * @param ignore - Whether to ignore permission checks.
     * @param rest - The rest of the arguments. If this is not set, the argument handler will automatically use the rest of the content.
     */
    static continue(command, ignore = false, rest = null) {
        return new Flag('continue', { command, ignore, rest });
    }
    /**
     * Checks if a value is a flag and of some type.
     * @param value - Value to check.
     * @param type - Type of flag.
     */
    static is(value, type) {
        return value instanceof Flag && value.type === type;
    }
}
//# sourceMappingURL=Flag.js.map