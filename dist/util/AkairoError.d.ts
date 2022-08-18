import { SlashOption } from '../struct/slashCommands/SlashCommand';
declare const Messages: {
    FILE_NOT_FOUND: (filename: string) => string;
    MODULE_NOT_FOUND: (constructor: string, id: string) => string;
    ALREADY_LOADED: (constructor: string, id: string) => string;
    NOT_RELOADABLE: (constructor: string, id: string) => string;
    INVALID_CLASS_TO_HANDLE: (given: string, expected: string) => string;
    ALIAS_CONFLICT: (alias: string, id: string, conflict: string) => string;
    UNEXPECTED_SLASH_COMMAND_TYPE: (type: SlashOption['type']) => string;
    COMMAND_UTIL_EXPLICIT: string;
    UNKNOWN_MATCH_TYPE: (match: string) => string;
    NOT_INSTANTIABLE: (constructor: string) => string;
    NOT_IMPLEMENTED: (constructor: string, method: string) => string;
    INVALID_TYPE: (name: string, expected: string, vowel?: boolean) => string;
};
interface MessageArgs {
    FILE_NOT_FOUND: [filename: string];
    MODULE_NOT_FOUND: [constructor: string, id: string];
    ALREADY_LOADED: [constructor: string, id: string];
    NOT_RELOADABLE: [constructor: string, id: string];
    INVALID_CLASS_TO_HANDLE: [given: string, expected: string];
    ALIAS_CONFLICT: [alias: string, id: string, conflict: string];
    UNEXPECTED_SLASH_COMMAND_TYPE: [type: SlashOption['type']];
    COMMAND_UTIL_EXPLICIT: [];
    UNKNOWN_MATCH_TYPE: [match: string];
    NOT_INSTANTIABLE: [constructor: string];
    NOT_IMPLEMENTED: [constructor: string, method: string];
    INVALID_TYPE: [name: string, expected: string, vowel: boolean];
}
/**
 * Represents an error for Akairo.
 */
export default class AkairoError<K extends keyof typeof Messages> extends Error {
    /**
     * The error code.
     */
    code: string;
    /**
     * @param key - Error key.
     * @param args - Arguments.
     */
    constructor(key: K, ...args: MessageArgs[K]);
    /**
     * The error name.
     */
    get name(): string;
}
export {};
//# sourceMappingURL=AkairoError.d.ts.map