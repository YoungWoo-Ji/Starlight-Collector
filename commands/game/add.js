const { SlashCommandBuilder, EmbedBuilder,AttachmentBuilder } = require("discord.js");
const Database = require('better-sqlite3')
const ItemData = require('../../GameData/items.json')

module.exports = {
	data: new SlashCommandBuilder()
    .setDMPermission(false)
		.setName('도감등록')
		.setDescription('가지고있는 보석을 도감에 등록합니다.')
    .addStringOption(option=>
      option
        .setName('보석')
        .setDescription('등록할 보석의 이름')
        .setRequired(true)
    ),
	async execute(interaction) {

    const gem = interaction.options.getString("보석")
    const id = interaction.user.id
    const server = interaction.guildId
    const db = new Database('DB/user.db')

	// 등록 가능 아이템인지 확인
	const banned_item = ["돌 조각","보석 조각","하급원석","중급원석","상급원석","수상한 원석"]
	if(banned_item.indexOf(gem) !== -1){
		await interaction.reply({ephemeral:true,content:"⚠️ 해당 아이템은 도감에 등록할 수 없습니다."})
		return
	}
		
    // 소지 여부 확인
    const your_item = db.prepare('SELECT * FROM inventory WHERE user_id=? AND server=? AND item=?')
      .get(id,server,gem)
    if(!your_item){
      await interaction.reply({ephemeral:true,content:"⚠️ 해당 아이템을 소지하고 있지 않습니다."})
      db.close()
      return
    }

    // 도감 등록 여부 확인
    const your_dex = db.prepare('SELECT * FROM dex WHERE user_id=? AND server=? AND gem=?')
      .get(id,server,gem)
    if(your_dex){
      await interaction.reply({ephemeral:true,content:"⚠️ 해당 보석은 이미 도감에 등록되었습니다."})
      db.close()
      return
    }

    //아이템 1개 줄이기
    if(your_item.count>1){
      db.prepare("UPDATE inventory SET count=count-1 WHERE user_id=? AND server=? AND item=?")
        .run(id,server,gem)
    }else{
      db.prepare("DELETE FROM inventory WHERE user_id=? AND server=? AND item=?")
        .run(id,server,gem)
    }

    // 도감 등록
    db.prepare('INSERT INTO dex (user_id,server,gem) VALUES (?,?,?)')
      .run(id,server,gem)
    
    const total_collect = db.prepare('SELECT * FROM dex WHERE user_id=? AND server=?')
      .all(id,server)
    db.close()

    const total_gem = Object.keys(ItemData).filter(e=>ItemData[e].type==='gem')

    const embed = new EmbedBuilder()
      .setTitle('📙 보석이 도감에 등록되었습니다.')
      .setColor('Blurple')
      .setDescription(`**${gem}**이(가) 도감에 등록되었습니다!\n\n`+
        `- 수집한 보석 수: ${total_collect.length}개\n`+
        `- 남은 보석 수: ${total_gem.length-total_collect.length}개\n`
      )
      .setFooter({text:'/도감 명령어로 등록된 보석을 확인하세요.'})
      .setThumbnail('attachment://item.png')
    const file = new AttachmentBuilder(`asset/${gem}-export.png`,{name:'item.png'})

    await interaction.reply({embeds:[embed],files:[file]})
  }
}
