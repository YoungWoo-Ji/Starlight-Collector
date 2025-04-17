const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Database = require('better-sqlite3')

module.exports = {
	data: new SlashCommandBuilder()
    .setDMPermission(false)
		.setName('보관함')
		.setDescription('소지중인 물품을 확인합니다'),
	async execute(interaction) {
    const db = new Database('DB/user.db')
    const items = db.prepare('SELECT * FROM inventory where user_id=? AND server=?')
      .all(interaction.user.id,interaction.guildId)
    
    let list = ''
    if(items.length==0){
      list = '소지하고 있는 물품이 없습니다.'
    }else{
      l = items.length
      for(let i=0;i<l;i++){
        item = items[i]
        list+=`[${i+1}] ${item.item} x ${item.count}\n`
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('💎 보관함')
      .setDescription('현재 소지 중인 물품입니다.\n```\n'+list+'\n```')
      .setColor('Blurple')
      .setFooter({text:'/감정하기 명령어로 소지중인 물품을 자세히 살펴보세요'})
    
    await interaction.reply({embeds:[embed]})
  }
}