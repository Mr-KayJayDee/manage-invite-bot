const Command = require("../../structures/Command.js");
const Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "setjoindm",
            enabled: true,
            aliases: [ "setdm", "setdmjoin" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Enable or disable the join DM message"
            }
        });
    }

    async run (message) {
        const guildPlugins = await this.client.database.fetchGuildPlugins(message.guild.id);
        const plugin = guildPlugins.find((p) => p.pluginName === "joinDM")?.pluginData;

        if (!plugin?.enabled){
            await this.client.database.updateGuildPlugin(message.guild.id, "joinDM", {
                ...(plugin || {}),
                enabled: true
            });
            return message.success("config/setjoindm:ENABLED");
        }
        if (plugin.enabled){
            await this.client.database.updateGuildPlugin(message.guild.id, "joinDM", {
                ...plugin,
                enabled: false
            });
            return message.success("config/setjoindm:DISABLED");
        }
    }

    async runInteraction (interaction) {
        const guildPlugins = await this.client.database.fetchGuildPlugins(interaction.guild.id);
        const plugin = guildPlugins.find((p) => p.pluginName === "joinDM")?.pluginData;

        if (!plugin?.enabled){
            await this.client.database.updateGuildPlugin(interaction.guild.id, "joinDM", {
                ...(plugin || {}),
                enabled: true
            });
            return interaction.reply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("config/setjoindm:ENABLED") });
        }
        if (plugin.enabled){
            await this.client.database.updateGuildPlugin(interaction.guild.id, "joinDM", {
                ...plugin,
                enabled: false
            });
            return interaction.reply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("config/setjoindm:DISABLED") });
        }
    }
};
