const Database = require('better-sqlite3')
const { EmbedBuilder } = require('discord.js')

module.exports = {
  name:"trade1",
  async execute(interaction){
    const db = new Database('DB/user.db')
    const stone = db.prepare("SELECT count FROM inventory WHERE user_id=? AND server=? AND item=?")
      .get(interaction.user.id,interaction.guildId,'돌 조각')

    if(stone){
      db.close()
      await interaction.reply({content:'⚠️ 돌 조각은 최대 1개만 소지 가능합니다.',ephemeral:true})
      return
    }

    const add_stone = db.prepare('INSERT INTO inventory (user_id,server,item,count) VALUES (?,?,?,?)')
      .run(interaction.user.id,interaction.guildId,'돌 조각',1)
    
    const embed = new EmbedBuilder()
      .setTitle('거래 완료!')
      .setColor('Blurple')
      .setTimestamp()
      .setDescription(
        '거래가 완료되었습니다. 거래내역을 확인하세요!\n'+
        '```\n+ 돌 조각 x 1\n```')

    await interaction.reply({embeds:[embed]})
  }
}