const { SlashCommandBuilder, EmbedBuilder,ActionRowBuilder,PermissionFlagsBits,ButtonBuilder,ButtonStyle } = require("discord.js");
const Database = require('better-sqlite3')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('채널설정')
		.setDescription('알림 채널을 설정합니다.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
	async execute(interaction) {
    const {guildId,channelId} = interaction
    const db = new Database('DB/user.db')
    const channel = db.prepare('SELECT * FROM channel WHERE server=? AND channel=?').get(guildId,channelId)
    let is_on = false
    if(channel) is_on=true

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle('채널 설정')
      .setDescription(
        `<#${interaction.channelId}> 채널 상태입니다.\n\n`+
        `📢 어플 알림: **${is_on?'ON':'OFF'}**\n\n`
      )
    const notice = new ButtonBuilder()
      .setCustomId('notice-'+interaction.user.id)
      .setLabel(`알림 ${is_on?'OFF':'ON'}`)
      .setEmoji('📢')
      .setStyle(2)
    const row = new ActionRowBuilder().addComponents(notice)
    await interaction.reply({embeds:[embed],components:[row]})
  }
}