import type { Message } from 'discord.js';

/**
 * Represents a special return value during command execution or argument parsing.
 */
export default class Flag {
    /**
     * The type of flag.
     */
    public declare type: string;

    /**
     * @param type - Type of flag.
     * @param data - Extra data.
     */
    constructor(type: string, data: any = {}) {
        this.type = type;
        Object.assign(this, data);
    }

    /**
     * Creates a flag that cancels the command.
     */
    public static cancel(): Flag {
        return new Flag('cancel');
    }

    /**
     * Creates a flag that retries with another input.
     * @param message - Message to handle.
     */
    public static retry(message: Message): Flag {
        return new Flag('retry', { message });
    }

    /**
     * Creates a flag that acts as argument cast failure with extra data.
     * @param value - The extra data for the failure.
     */
    public static fail(value: any): Flag {
        return new Flag('fail', { value });
    }

    /**
     * Creates a flag that runs another command with the rest of the arguments.
     * @param command - MessageCommand ID.
     * @param ignore - Whether to ignore permission checks.
     * @param rest - The rest of the arguments. If this is not set, the argument handler will automatically use the rest of the content.
     */
    public static continue(
        command: string,
        ignore = false,
        rest: string | null = null
    ): Flag {
        return new Flag('continue', { command, ignore, rest });
    }

    /**
     * Checks if a value is a flag and of some type.
     * @param value - Value to check.
     * @param type - Type of flag.
     */
    public static is(value: any, type: string): boolean {
        return value instanceof Flag && value.type === type;
    }
}
