const { EmbedBuilder} = require('discord.js')
const Database = require('better-sqlite3')
const client = require('../../client')

module.exports = {
  name:"cancel_trade",
  async execute(interaction){
    //db
    const db = new Database('DB/user.db')
    const server = interaction.guildId
    const your_id = interaction.user.id

    const your_trade_data = db.prepare('SELECT * FROM trade WHERE user_id=? AND server=?')
      .get(your_id,server)

    //거래중인지 확인
    if(!your_trade_data){
      db.close()
      await interaction.reply({ephemeral:true, content:'⚠️ 현재 거래하고 있지 않습니다.'})
      return
    }

    //거래 데이터 삭제
    db.prepare('DELETE FROM trade WHERE id=?').run(your_trade_data.id)

    const embed = new EmbedBuilder()
      .setTitle('❌ 거래 취소됨')
      .setColor('Blurple')
      .setDescription(`<@${your_id}> 님의 요청에 의해 거래가 취소되었습니다.`)
      .setTimestamp()

    const trade_channel = await client.channels.fetch(your_trade_data.channel)
    const trade_message = await trade_channel.messages.fetch(your_trade_data.id)

    await trade_message.edit({ embeds:[embed], components:[] })
    await interaction.deferUpdate()

  }
}