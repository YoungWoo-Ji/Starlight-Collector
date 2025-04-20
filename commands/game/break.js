const Database = require("better-sqlite3");
const { SlashCommandBuilder, EmbedBuilder,ActionRowBuilder,ButtonBuilder,ButtonStyle, AttachmentBuilder } = require("discord.js");
const ItemData = require('../../GameData/items.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('분해하기')
		.setDescription('보석을 보석 조각으로 분해합니다.')
    .setDMPermission(false)
    .addStringOption(option=>
      option
        .setRequired(true)
        .setName('보석')
        .setDescription('분해할 보석 이름')
    ),
	async execute(interaction) {
    const db = new Database('DB/user.db')
    const gem_name = interaction.options.getString('보석')
    
    const id = interaction.user.id 
    const server = interaction.guildId

    const is_exist = db.prepare('SELECT * FROM inventory WHERE user_id=? AND server=? AND item=?')
      .get(id,server,gem_name)

    //보석 소지 여부
    if(!is_exist){
      db.close()
      await interaction.reply({ephemeral:true, content:'⚠️ 해당 이름의 보석을 가지고 있지 않습니다.'})
      return
    }

    //보석인지 여부
    if(ItemData[gem_name].type!='gem'){
      db.close()
      await interaction.reply({ephemeral:true, content:'⚠️ 해당 물품은 분해할 수 없습니다.'})
      return
    }

    const tier = ItemData[gem_name].tier
    let get_num = 1

    switch (tier) {
      case 'common':
        get_num = 1+Math.floor(Math.random()*4)
        break;
      case 'rare':
        get_num = 10+Math.floor(Math.random()*21)
        break;
      case 'epic':
        get_num = 20+Math.floor(Math.random()*41)
        break;
      case 'unknown':
        get_num = 50+Math.floor(Math.random()*51)
        break;
    }
   
    const result_item = '보석 조각'
    //보석 제거
    db.prepare("UPDATE inventory SET count=count-1 WHERE user_id=? AND server=? AND item=?")
      .run(id,server,gem_name)
    db.prepare("DELETE FROM inventory WHERE count=?")
      .run(0)
    //아이템 추가
    const find = db.prepare('SELECT * FROM inventory WHERE user_id=? AND server=? AND item=?')
      .get(id,server,result_item)
    if(find){
      db.prepare("UPDATE inventory SET count=count+"+String(get_num)+" WHERE user_id=? AND server=? AND item=?")
      .run(id,server,result_item)
    }else{
      db.prepare('INSERT INTO inventory (user_id,server,item,count) VALUES (?,?,?,?)')
      .run(id,server,result_item,get_num)
    }

    db.close()

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle('⚒️ 분해결과')
      .setDescription(
        `<@${id}> 님의 **${gem_name}** 분해 결과입니다!\n\n`+
        `보석 조각: **${get_num}**개를 획득하셨습니다!`
      )
      .setTimestamp()
      .setThumbnail('attachment://item.png')
    const file = new AttachmentBuilder('asset/보석 조각-export.png',{name:'item.png'})
    
    await interaction.reply({embeds:[embed],files:[file]})
  }
}
