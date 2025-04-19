const { EmbedBuilder,ActionRowBuilder,ButtonBuilder } = require('discord.js')
const Database = require('better-sqlite3')
module.exports = {
  name:"boost",
  async execute(interaction){
    const {guildId,channelId}= interaction

    const db = new Database('DB/user.db')
    let channel = db.prepare('SELECT * FROM channel WHERE server=? AND channel=?')
      .get(guildId,channelId)
    
    if(!channel){
      channel = {notice:0,boost:1}
      db.prepare("INSERT INTO channel (server,channel,boost) VALUES (?,?,?)")
      .run(guildId,channelId,1)
    }else{
      if(channel.boost){
        if(channel.notice===1){
          db.prepare("UPDATE channel SET boost=? WHERE server=? AND channel=?")
          .run(0,guildId,channelId)
        }else{
          db.prepare("DELETE FROM channel WHERE server=? AND channel=?")
          .run(guildId,channelId)
        }
        channel.boost=0
      }else{
          db.prepare("UPDATE channel SET boost=? WHERE server=? AND channel=?")
          .run(1,guildId,channelId)
          channel.boost=1
      }
    }

    const embed = new EmbedBuilder()
    .setColor('Blurple')
    .setTitle('채널 설정')
    .setDescription(
      `<#${channelId}> 채널 상태입니다.\n\n`+
      `- 📢 **알림채널**\n세공완료 등 어플과 관련된 알림이 오는 채널입니다.\n(현재상태: **${channel.notice?'ON':'OFF'}**)\n\n`+
      `- 🚀 **부스터채널**\n부스터채널에서 채팅 시 세공속도가 2배가 됩니다!\n(현재상태: **${channel.boost?'ON':'OFF'}**)\n`
    )
  const notice = new ButtonBuilder()
    .setCustomId('notice-'+interaction.user.id)
    .setLabel(`알림 ${channel.notice?'OFF':'ON'}`)
    .setEmoji('📢')
    .setStyle(2)
  const boost = new ButtonBuilder()
    .setCustomId('boost-'+interaction.user.id)
    .setLabel(`부스터 ${channel.boost?'OFF':'ON'}`)
    .setEmoji('🚀')
    .setStyle(2)
  const row = new ActionRowBuilder().addComponents(notice,boost)

  await interaction.update({embeds:[embed],components:[row]})
  }
}