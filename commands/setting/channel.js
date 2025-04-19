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
    const notice_channel = db.prepare('SELECT * FROM channel WHERE server=? AND channel=? AND notice=?').get(guildId,channelId,1)
    const boost_channel = db.prepare('SELECT * FROM channel WHERE server=? AND channel=? AND boost=?').get(guildId,channelId,1)
    let is_notice_on = false
    let is_boost_on = false
    if(notice_channel) is_notice_on=true
    if(boost_channel) is_boost_on=true

    const embed = new EmbedBuilder()
    .setColor('Blurple')
    .setTitle('채널 설정')
    .setDescription(
      `<#${channelId}> 채널 상태입니다.\n\n`+
      `- 📢 **알림채널**\n세공완료 등 어플과 관련된 알림이 오는 채널입니다.\n(현재상태: **${is_notice_on?'ON':'OFF'}**)\n\n`+
      `- 🚀 **부스터채널**\n부스터채널에서 채팅 시 세공속도가 2배가 됩니다!\n(현재상태: **${is_boost_on?'ON':'OFF'}**)\n`
    )
    const notice = new ButtonBuilder()
      .setCustomId('notice-'+interaction.user.id)
      .setLabel(`알림 ${is_notice_on?'OFF':'ON'}`)
      .setEmoji('📢')
      .setStyle(2)
    const boost = new ButtonBuilder()
      .setCustomId('boost-'+interaction.user.id)
      .setLabel(`부스터 ${is_boost_on?'OFF':'ON'}`)
      .setEmoji('🚀')
      .setStyle(2)
    const row = new ActionRowBuilder().addComponents(notice,boost)
    await interaction.reply({embeds:[embed],components:[row]})
  }
}