const Database = require('better-sqlite3')
const { EmbedBuilder } = require('discord.js')

module.exports = {
  name:"trade3",
  async execute(interaction){

    const id= interaction.user.id
    const server = interaction.guildId
    const trade_item = '하급원석'
    const result_item = '중급원석'

    const db = new Database('DB/user.db')
    const your_item = db.prepare("SELECT * FROM inventory WHERE user_id=? AND server=? AND item=?")
      .get(id,server,trade_item)
    const min_count = 10

    


    //소지하고있는지 확인
    if(!your_item){
      await interaction.reply({ephemeral:true, content:'⚠️ 거래에 필요한 아이템을 가지고 있지 않습니다.'})
      db.close()
      return
    }

    //수량 맞는지 확인
    if(your_item.count<min_count){
      await interaction.reply({ephemeral:true, content:'⚠️ 거래에 필요한 최소 수량을 가지고 있지 않습니다.'})
      db.close()
      return
    }

    //아이템 삭제
    if(your_item.count == min_count){
      db.prepare('DELETE FROM inventory WHERE user_id=? AND server=? AND item=?')
        .run(id,server,trade_item)
    }else{
      db.prepare(`UPDATE inventory SET count=count- ${min_count} WHERE user_id=? AND server=? AND item=?`)
        .run(id,server,trade_item)
    }

    //아이템 추가
    const find = db.prepare('SELECT * FROM inventory WHERE user_id=? AND server=? AND item=?')
      .get(id,server,result_item)
    if(find){
      db.prepare("UPDATE inventory SET count=count+1 WHERE user_id=? AND server=? AND item=?")
      .run(id,server,result_item)
    }else{
      db.prepare('INSERT INTO inventory (user_id,server,item) VALUES (?,?,?)')
      .run(id,server,result_item)
    }
    

    db.close()
    const embed = new EmbedBuilder()
      .setTitle('💰 거래 완료!')
      .setColor('Blurple')
      .setTimestamp()
      .setDescription(
        '거래가 완료되었습니다. 거래내역을 확인하세요!\n'+
        '```\n'+
        '- 하급원석 x 10\n+ 중급원석 x 1'+
        '\n```')

    await interaction.reply({embeds:[embed]})
  }
}