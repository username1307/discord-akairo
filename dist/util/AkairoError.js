const Messages = {
    // Module-related
    FILE_NOT_FOUND: (filename) => `File '${filename}' not found`,
    MODULE_NOT_FOUND: (constructor, id) => `${constructor} '${id}' does not exist`,
    ALREADY_LOADED: (constructor, id) => `${constructor} '${id}' is already loaded`,
    NOT_RELOADABLE: (constructor, id) => `${constructor} '${id}' is not reloadable`,
    INVALID_CLASS_TO_HANDLE: (given, expected) => `Class to handle ${given} is not a subclass of ${expected}`,
    // MessageCommand-related
    ALIAS_CONFLICT: (alias, id, conflict) => `Alias '${alias}' of '${id}' already exists on '${conflict}'`,
    UNEXPECTED_SLASH_COMMAND_TYPE: (type) => `Unexpected slash command type '${type}', where there is a subcommand and or subcommandGroup.`,
    // Options-related
    COMMAND_UTIL_EXPLICIT: 'The command handler options `handleEdits` and `storeMessages` require the `commandUtil` option to be true',
    UNKNOWN_MATCH_TYPE: (match) => `Unknown match type '${match}'`,
    // Generic errors
    NOT_INSTANTIABLE: (constructor) => `${constructor} is not instantiable`,
    NOT_IMPLEMENTED: (constructor, method) => `${constructor}#${method} has not been implemented`,
    INVALID_TYPE: (name, expected, vowel = false) => `Value of '${name}' was not ${vowel ? 'an' : 'a'} ${expected}`,
};
/**
 * Represents an error for Akairo.
 */
export default class AkairoError extends Error {
    /**
     * @param key - Error key.
     * @param args - Arguments.
     */
    constructor(key, ...args) {
        if (Messages[key] == null)
            throw new TypeError(`Error key '${key}' does not exist`);
        const message = typeof Messages[key] === 'function'
            ? Messages[key](...args)
            : Messages[key];
        super(message);
        this.code = key;
    }
    /**
     * The error name.
     */
    get name() {
        return `AkairoError [${this.code}]`;
    }
}
//# sourceMappingURL=AkairoError.js.map