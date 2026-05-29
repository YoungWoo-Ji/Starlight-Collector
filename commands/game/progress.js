const { SlashCommandBuilder, EmbedBuilder,AttachmentBuilder } = require("discord.js");
const Database = require('better-sqlite3')
const ItemData = require('../../GameData/items.json')

function makeBar (count, max, barLength) {
  const BAR = ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'];

  let length = (barLength * count / max),
      int = Math.round(length),
      result = BAR[8].repeat(int);

  return (result + '░'.repeat(barLength - result.length));
}

module.exports = {
	data: new SlashCommandBuilder()
    .setDMPermission(false)
		.setName('세공상태')
		.setDescription('세공 상태를 확인합니다.'),
	async execute(interaction) {
    const db = new Database('DB/user.db')

    const item = db.prepare("SELECT * FROM break WHERE user_id=? AND server=?")
      .get(interaction.user.id,interaction.guildId)
    
    if(!item){
      await interaction.reply({ephemeral:true,content:"⚠️ 세공 중인 아이템이 없습니다."})
      return
    }
    db.close()

    const file = new AttachmentBuilder(`asset/${item.item}-export.png`,{name:'item.png'})
    const embed = new EmbedBuilder()
      .setTitle('💎 세공 상태')
      .setColor('Blurple')
      .setDescription('현재 '+item.item+' 의 세공 상태입니다')
      .setThumbnail("attachment://item.png")
      .setTimestamp()
      .addFields({name:'세공 상태',value:'```\n'+
        `세공 진행도(${Math.floor(item.count/ItemData[item.item].count*100)}%)  |${makeBar(item.count,ItemData[item.item].count,15)}|[${item.count}/${ItemData[item.item].count}]`+'\n```'
      })
    await interaction.reply({embeds:[embed],files:[file]})
  }
}
