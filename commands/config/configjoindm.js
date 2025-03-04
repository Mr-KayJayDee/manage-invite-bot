const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    variables = require("../../helpers/variables"),
    Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "configdmjoin",
            enabled: true,
            aliases: [ "dmjoin", "joindm", "configjoindm", "dm", "configdm" ],
            clientPermissions: [ "EMBED_LINKS", "ADMINISTRATOR" ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Configure join DM messages"
            }
        });
    }

    async run (message, args, data) {

        const guildPlugins = await this.client.database.fetchGuildPlugins(message.guild.id);
        const plugin = guildPlugins.find((p) => p.pluginName === "joinDM")?.pluginData;

        const opt = { filter: (m) => m.author.id === message.author.id, max: 1, time: 90000, errors: [ "time" ] };
        
        const str = plugin?.enabled ? message.translate("config/configjoindm:DISABLE", {
            prefix: message.guild.settings.prefix
        }) : "";
        const msg = await message.sendT("config/configjoindm:INSTRUCTIONS_1", {
            string: `${str}`,
            variables: variables.filter((v) => !v.ignore).map((variable) => `{${variable.name}} | ${message.translate(`config/configjoin:VARIABLE_${variable.name.toUpperCase()}`)}` + (variable.endPart ? "\n" : "")).join("\n")
        });

        const collected = await message.channel.awaitMessages(opt).catch(() => {});
        if (!collected || !collected.first()) return msg.error("common:CANCELLED", null, true);
        const confMessage = collected.first().content;
        if (confMessage === "cancel") return msg.error("common:CANCELLED", null, true);
        if (confMessage === message.guild.settings.prefix+"setdmjoin") return;

        msg.sendT("config/configjoindm:SUCCESS", null, true);

        const embed = new Discord.MessageEmbed()
            .setTitle(message.translate("config/configjoindm:TITLE"))
            .addField(message.translate("common:MESSAGE"), confMessage)
            .addField(message.translate("common:TEST_IT"), message.translate("config/configjoindm:TEST", {
                prefix: message.guild.settings.prefix
            }))
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter(data.footer);
        message.channel.send({ embeds: [embed] });

        await this.client.database.updateGuildPlugin(message.guild.id, "joinDM", {
            ...(plugin || {}),
            enabled: true,
            mainMessage: confMessage
        });
    }

    async runInteraction (interaction, data) {

        const guildPlugins = await this.client.database.fetchGuildPlugins(interaction.guild.id);
        const plugin = guildPlugins.find((p) => p.pluginName === "joinDM")?.pluginData;

        const opt = { filter: (m) => m.author.id === interaction.user.id, max: 1, time: 90000, errors: [ "time" ] };
        
        const str = plugin?.enabled ? interaction.translate("config/configjoindm:DISABLE", {
            prefix: interaction.guild.settings.prefix
        }) : "";
        await interaction.reply({ content: interaction.guild.translate("config/configjoindm:INSTRUCTIONS_1", {
            string: `${str}`,
            variables: variables.filter((v) => !v.ignore).map((variable) => `{${variable.name}} | ${interaction.guild.translate(`config/configjoin:VARIABLE_${variable.name.toUpperCase()}`)}` + (variable.endPart ? "\n" : "")).join("\n")
        }) });

        const collected = await interaction.channel.awaitMessages(opt).catch(() => {});
        if (!collected || !collected.first()) return interaction.editReply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("common:CANCELLED") });
        const confMessage = collected.first().content;
        if (confMessage === "cancel") return interaction.editReply({ content: Constants.Emojis.ERROR + " " + interaction.guild.translate("common:CANCELLED") });
        if (confMessage === interaction.guild.settings.prefix+"setdmjoin") return;

        const embed = new Discord.MessageEmbed()
            .setTitle(interaction.guild.translate("config/configjoindm:TITLE"))
            .addField(interaction.guild.translate("common:MESSAGE"), confMessage)
            .addField(interaction.guild.translate("common:TEST_IT"), interaction.guild.translate("config/configjoindm:TEST", {
                prefix: interaction.guild.settings.prefix
            }))
            .setThumbnail(interaction.user.avatarURL())
            .setColor(data.color)
            .setFooter(data.footer);

        interaction.editReply({ content: interaction.guild.translate("config/configjoindm:SUCCESS"), embeds: [embed] });

        await this.client.database.updateGuildPlugin(interaction.guild.id, "joinDM", {
            ...(plugin || {}),
            enabled: true,
            mainMessage: confMessage
        });

    }

};
