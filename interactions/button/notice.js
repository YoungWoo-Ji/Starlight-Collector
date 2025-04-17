const { EmbedBuilder,ActionRowBuilder,ButtonBuilder } = require('discord.js')
const Database = require('better-sqlite3')
module.exports = {
  name:"notice",
  async execute(interaction){
    const {guildId,channelId}= interaction

    const db = new Database('DB/user.db')
    const channel = db.prepare('SELECT * FROM channel WHERE server=? AND channel=?').get(guildId,channelId)
    let is_on
    if(!channel){
      is_on=true
      db.prepare("INSERT INTO channel (server,channel) VALUES (?,?)")
      .run(guildId,channelId)
    }else{
      is_on=false
      db.prepare("DELETE FROM channel WHERE server=? AND channel=?")
      .run(guildId,channelId)
    }

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

  await interaction.update({embeds:[embed],components:[row]})
  }
}