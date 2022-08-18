"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
/**
 * Client utilities to help with common tasks.
 */
class ClientUtil {
    /**
     * @param client - The client.
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * Makes a MessageAttachment.
     * @param file - The file.
     * @param data - The filename.
     */
    attachment(file, data) {
        return new discord_js_1.AttachmentBuilder(file, data);
    }
    /**
     * Checks if a string could be referring to a channel.
     * @param text - Text to check.
     * @param channel - Channel to check.
     * @param caseSensitive - Makes checking by name case sensitive.
     * @param wholeWord - Makes checking by name match full word only.
     */
    checkChannel(text, channel, caseSensitive = false, wholeWord = false) {
        if (channel.id === text)
            return true;
        const reg = /<#(\d{17,19})>/;
        const match = text.match(reg);
        if (match && channel.id === match[1])
            return true;
        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? channel.name : channel.name.toLowerCase();
        if (!wholeWord) {
            return name.includes(text) || name.includes(text.replace(/^#/, ''));
        }
        return name === text || name === text.replace(/^#/, '');
    }
    /**
     * Checks if a string could be referring to a emoji.
     * @param text - Text to check.
     * @param emoji - Emoji to check.
     * @param caseSensitive - Makes checking by name case sensitive.
     * @param wholeWord - Makes checking by name match full word only.
     */
    checkEmoji(text, emoji, caseSensitive = false, wholeWord = false) {
        if (emoji.id === text)
            return true;
        const reg = /<a?:[a-zA-Z0-9_]+:(\d{17,19})>/;
        const match = text.match(reg);
        if (match && emoji.id === match[1])
            return true;
        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? emoji.name : emoji.name?.toLowerCase();
        if (!wholeWord) {
            return Boolean(name?.includes(text) || name?.includes(text.replace(/:/, '')));
        }
        return name === text || name === text.replace(/:/, '');
    }
    /**
     * Checks if a string could be referring to a guild.
     * @param text - Text to check.
     * @param guild - Guild to check.
     * @param caseSensitive - Makes checking by name case sensitive.
     * @param wholeWord - Makes checking by name match full word only.
     */
    checkGuild(text, guild, caseSensitive = false, wholeWord = false) {
        if (guild.id === text)
            return true;
        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? guild.name : guild.name.toLowerCase();
        if (!wholeWord)
            return name.includes(text);
        return name === text;
    }
    /**
     * Checks if a string could be referring to a member.
     * @param text - Text to check.
     * @param member - Member to check.
     * @param caseSensitive - Makes checking by name case sensitive.
     * @param wholeWord - Makes checking by name match full word only.
     */
    checkMember(text, member, caseSensitive = false, wholeWord = false) {
        if (member.id === text)
            return true;
        const reg = /<@!?(\d{17,19})>/;
        const match = text.match(reg);
        if (match && member.id === match[1])
            return true;
        text = caseSensitive ? text : text.toLowerCase();
        const username = caseSensitive
            ? member.user.username
            : member.user.username.toLowerCase();
        const displayName = caseSensitive
            ? member.displayName
            : member.displayName.toLowerCase();
        const discrim = member.user.discriminator;
        if (!wholeWord) {
            return (displayName.includes(text) ||
                username.includes(text) ||
                ((username.includes(text.split('#')[0]) ||
                    displayName.includes(text.split('#')[0])) &&
                    discrim.includes(text.split('#')[1])));
        }
        return (displayName === text ||
            username === text ||
            ((username === text.split('#')[0] ||
                displayName === text.split('#')[0]) &&
                discrim === text.split('#')[1]));
    }
    /**
     * Checks if a string could be referring to a role.
     * @param text - Text to check.
     * @param role - Role to check.
     * @param caseSensitive - Makes checking by name case sensitive.
     * @param wholeWord - Makes checking by name match full word only.
     */
    checkRole(text, role, caseSensitive = false, wholeWord = false) {
        if (role.id === text)
            return true;
        const reg = /<@&(\d{17,19})>/;
        const match = text.match(reg);
        if (match && role.id === match[1])
            return true;
        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? role.name : role.name.toLowerCase();
        if (!wholeWord) {
            return name.includes(text) || name.includes(text.replace(/^@/, ''));
        }
        return name === text || name === text.replace(/^@/, '');
    }
    /**
     * Resolves a user from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param user - Collection of users to find in.
     * @param caseSensitive - Makes finding by name case-sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    checkUser(text, user, caseSensitive = false, wholeWord = false) {
        if (user.id === text)
            return true;
        const reg = /<@!?(\d{17,19})>/;
        const match = text.match(reg);
        if (match && user.id === match[1])
            return true;
        text = caseSensitive ? text : text.toLowerCase();
        const username = caseSensitive
            ? user.username
            : user.username.toLowerCase();
        const discrim = user.discriminator;
        if (!wholeWord) {
            return (username.includes(text) ||
                (username.includes(text.split('#')[0]) &&
                    discrim.includes(text.split('#')[1])));
        }
        return (username === text ||
            (username === text.split('#')[0] && discrim === text.split('#')[1]));
    }
    /**
     * Makes a Collection.
     * @param iterable - Entries to fill with.
     */
    collection(iterable) {
        return new discord_js_1.Collection(iterable);
    }
    /**
     * Compares two member objects presences and checks if they stopped or started a stream or not.
     * Returns `0`, `1`, or `2` for no change, stopped, or started.
     * @param oldMember - The old member.
     * @param newMember - The new member.
     */
    compareStreaming(oldMember, newMember) {
        const s1 = oldMember.presence?.activities.find((c) => c.type === discord_js_1.ActivityType.Streaming);
        const s2 = newMember.presence?.activities.find((c) => c.type === discord_js_1.ActivityType.Streaming);
        if (s1 === s2)
            return 0;
        if (s1)
            return 1;
        if (s2)
            return 2;
        return 0;
    }
    /**
     * Makes a MessageEmbed.
     * @param data - Embed data.
     */
    embed(data) {
        return new discord_js_1.EmbedBuilder(data);
    }
    /**
     * Combination of `<Client>.fetchUser()` and `<Guild>.fetchMember()`.
     * @param guild - Guild to fetch in.
     * @param id - ID of the user.
     * @param cache - Whether to add to cache.
     */
    async fetchMember(guild, id, cache) {
        const user = await this.client.users.fetch(id, { cache });
        return guild.members.fetch({ user, cache });
    }
    /**
     * Array of permission names.
     */
    permissionNames() {
        return Object.keys(discord_js_1.PermissionsBitField.Flags);
    }
    /**
     * Resolves a channel from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param channels - Collection of channels to find in.
     * @param caseSensitive - Makes finding by name case-sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveChannel(text, channels, caseSensitive = false, wholeWord = false) {
        return (channels.get(text) ??
            channels.find((channel) => this.checkChannel(text, channel, caseSensitive, wholeWord)) ??
            null);
    }
    /**
     * Resolves multiple channels from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param channels - Collection of channels to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveChannels(text, channels, caseSensitive = false, wholeWord = false) {
        return channels.filter((channel) => this.checkChannel(text, channel, caseSensitive, wholeWord));
    }
    /**
     * Resolves a custom emoji from a string, such as a name or a mention.
     * @param text - Text to resolve.
     * @param emojis - Collection of emojis to find in.
     * @param caseSensitive - Makes finding by name case-sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveEmoji(text, emojis, caseSensitive = false, wholeWord = false) {
        return (emojis.get(text) ??
            emojis.find((emoji) => this.checkEmoji(text, emoji, caseSensitive, wholeWord)) ??
            null);
    }
    /**
     * Resolves multiple custom emojis from a string, such as a name or a mention.
     * @param text - Text to resolve.
     * @param emojis - Collection of emojis to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveEmojis(text, emojis, caseSensitive = false, wholeWord = false) {
        return emojis.filter((emoji) => this.checkEmoji(text, emoji, caseSensitive, wholeWord));
    }
    /**
     * Resolves a guild from a string, such as an ID or a name.
     * @param text - Text to resolve.
     * @param guilds - Collection of guilds to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveGuild(text, guilds, caseSensitive = false, wholeWord = false) {
        return (guilds.get(text) ??
            guilds.find((guild) => this.checkGuild(text, guild, caseSensitive, wholeWord)) ??
            null);
    }
    /**
     * Resolves multiple guilds from a string, such as an ID or a name.
     * @param text - Text to resolve.
     * @param guilds - Collection of guilds to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveGuilds(text, guilds, caseSensitive = false, wholeWord = false) {
        return guilds.filter((guild) => this.checkGuild(text, guild, caseSensitive, wholeWord));
    }
    /**
     * Resolves a member from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param members - Collection of members to find in.
     * @param caseSensitive - Makes finding by name case-sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveMember(text, members, caseSensitive = false, wholeWord = false) {
        return (members.get(text) ??
            members.find((member) => this.checkMember(text, member, caseSensitive, wholeWord)) ??
            null);
    }
    /**
     * Resolves multiple members from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param members - Collection of members to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveMembers(text, members, caseSensitive = false, wholeWord = false) {
        return members.filter((member) => this.checkMember(text, member, caseSensitive, wholeWord));
    }
    /**
     * Resolves a permission number and returns an array of permission names.
     * @param number - The permissions number.
     */
    resolvePermissionNumber(number) {
        const resolved = [];
        for (const key of Object.keys(discord_js_1.PermissionsBitField.Flags)) {
            if (BigInt(number) &&
                discord_js_1.PermissionsBitField.Flags[key])
                resolved.push(key);
        }
        return resolved;
    }
    /**
     * Resolves a role from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param roles - Collection of roles to find in.
     * @param caseSensitive - Makes finding by name case-sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveRole(text, roles, caseSensitive = false, wholeWord = false) {
        return (roles.get(text) ??
            roles.find((role) => this.checkRole(text, role, caseSensitive, wholeWord)) ??
            null);
    }
    /**
     * Resolves multiple roles from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param roles - Collection of roles to find in.
     * @param caseSensitive - Makes finding by name case-sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveRoles(text, roles, caseSensitive = false, wholeWord = false) {
        return roles.filter((role) => this.checkRole(text, role, caseSensitive, wholeWord));
    }
    /**
     * Resolves a user from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param users - Collection of users to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveUser(text, users, caseSensitive = false, wholeWord = false) {
        return (users.get(text) ??
            users.find((user) => this.checkUser(text, user, caseSensitive, wholeWord)) ??
            null);
    }
    /**
     * Resolves multiple users from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param users - Collection of users to find in.
     * @param caseSensitive - Makes finding by name case-sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveUsers(text, users, caseSensitive = false, wholeWord = false) {
        return users.filter((user) => this.checkUser(text, user, caseSensitive, wholeWord));
    }
}
exports.default = ClientUtil;
//# sourceMappingURL=ClientUtil.js.map