const { SlashCommandBuilder, EmbedBuilder,AttachmentBuilder } = require("discord.js");
const Database = require('better-sqlite3')
const ItemData = require('../../GameData/items.json')

module.exports = {
	data: new SlashCommandBuilder()
    .setDMPermission(false)
		.setName('감정하기')
		.setDescription('가지고있는 물품을 감정합니다.')
    .addStringOption(option=>
      option
        .setName('이름')
        .setDescription('감정할 물품의 이름')
        .setRequired(true)
    ),
	async execute(interaction) {
    const db = new Database('DB/user.db')
    const id = interaction.user.id
    const server = interaction.guildId
    const item = interaction.options.getString("이름")

    //해당 아이템을 소지 중인지 확인
    const your_item = db.prepare('SELECT * FROM inventory WHERE user_id=? AND server=? AND item=?')
      .get(id,server,item)
    db.close()
    if(!your_item){
      await interaction.reply({ephemeral:true,content:"⚠️ 해당 아이템을 소지하고 있지 않습니다."})
      return
    }

    const info = ItemData[item]
    const tier = {'epic':'상급','rare':'중급','common':'하급','none':'없음','unknown':'알 수 없음'}
    const type = {'gem':'보석','etc':'잡화','stone':'원석'}
    let desc = `- 종류: ${type[info.type]}\n`+`- 등급: ${tier[info.tier]}\n`

    if(info.type=='stone'){
      desc+=`- 세공에 필요한 채팅 수: ${info.count}회`
    }

    const file = new AttachmentBuilder(`asset/${item}-export.png`,{name:'item.png'})
    const embed = new EmbedBuilder()
      .setTitle(item)
      .setDescription(desc)
      .setColor('Blurple')
      .setThumbnail('attachment://item.png')

    await interaction.reply({embeds:[embed],files:[file]})

  }
}