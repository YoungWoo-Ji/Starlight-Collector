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
		.setName('세공하기')
		.setDescription('아이템을 세공합니다.')
    .setDMPermission(false)
    .addStringOption(option=>
      option
        .setName('이름')
        .setDescription('세공할 물품의 이름')
        .setRequired(true)
        .setAutocomplete(true)
    ),
  async autocomplete(interaction) {
    const items = ["돌 조각", "하급원석", "중급원석", "상급원석", "수상한 원석"];
    const focusedValue = interaction.options.getFocused();
    const filtered = items.filter(item => item.includes(focusedValue));
    await interaction.respond(
        filtered.map(e => ({ name: e, value: e }))
    );
},
	async execute(interaction) {
    const item = interaction.options.getString("이름")

    //해당 아이템이 있는지 확인
    if(Object.keys(ItemData).indexOf(item)==-1){
      await interaction.reply({ephemeral:true,content:'⚠️ 해당 이름의 아이템은 존재하지 않습니다.'})
      return
    }

    const type = ItemData[item].type

    //세공가능한 아이템인지 확인
    if(type!='stone'){
      await interaction.reply({ephemeral:true,content:'⚠️ 해당 아이템은 세공할 수 없습니다.'})
      return
    }

    const db = new Database('DB/user.db')
    const id = interaction.user.id
    const server = interaction.guildId
    const find = db.prepare("SELECT * FROM break WHERE user_id=? AND server=?")
      .get(id,server)

    //이미 세공중인 아이템이 있는지 확인
    if(find){
      await interaction.reply({ephemeral:true,content:'⚠️ 이미 세공 중인 아이템이 있습니다.'})
      db.close()
      return
    }

    //해당 아이템을 소지 중인지 확인
    const your_item = db.prepare('SELECT * FROM inventory WHERE user_id=? AND server=? AND item=?')
      .get(id,server,item)
    if(!your_item){
      await interaction.reply({ephemeral:true,content:"⚠️ 해당 아이템을 소지하고 있지 않습니다."})
      db.close()
      return
    }

    //아이템 1개 줄이기
    if(your_item.count>1){
      const update = db.prepare("UPDATE inventory SET count=count-1 WHERE user_id=? AND server=? AND item=?")
        .run(id,server,item)
    }else{
      const delete_item = db.prepare("DELETE FROM inventory WHERE user_id=? AND server=? AND item=?")
        .run(id,server,item)
    }

    //세공 포함하기
    const insert = db.prepare("INSERT INTO break (user_id,server,item) VALUES (?,?,?)")
      .run(id,server,item)
    db.close()

    //임베드 전송
    const file = new AttachmentBuilder(`asset/${item}-export.png`,{name:'item.png'})
    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle("⚒️ 보석 세공 시작!")
      .setDescription(`**${item} 세공을 시작합니다!**\n이 서버에서의 채팅이 세공 진행도에 반영됩니다.\n\n`+
      '```\n'+`세공 진행도(0%)  |${makeBar(0,1,15)}|[0/${ItemData[item].count}]`+'\n```'
      )
      .setThumbnail(`attachment://item.png`)
      .setTimestamp()
    await interaction.reply({embeds:[embed],files:[file]})
  }
}
