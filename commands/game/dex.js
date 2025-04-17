const { SlashCommandBuilder, EmbedBuilder,ActionRowBuilder,ButtonBuilder,ButtonStyle, AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage } = require('@napi-rs/canvas')
const ItemData = require('../../GameData/items.json');
const Database = require("better-sqlite3");

function makeBar (count, max, barLength) {
  const BAR = ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'];

  let length = (barLength * count / max),
      int = Math.round(length),
      result = BAR[8].repeat(int);

  return (result + '░'.repeat(barLength - result.length));
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('도감')
		.setDescription('지금까지 수집한 보석을 확인합니다.')
    .setDMPermission(false)
    .addStringOption(option=>
      option
        .setName('보석')
        .setDescription('도감을 확인할 보석의 이름')
    ),
	async execute(interaction) {

    const gem_name = interaction.options.getString('보석')
    const db = new Database('DB/user.db')
    const gem_listed = db.prepare("SELECT gem FROM dex WHERE user_id=? AND server=?")
      .all(interaction.user.id,interaction.guildId)
      .map((v,i,a)=>v.gem)
    db.close()

    //옵션 선택 시
    if(gem_name){

      if(gem_listed.indexOf(gem_name)==-1){
        await interaction.reply({ephemeral:true,content:'⚠️ 해당 이름의 보석은 도감에 등록되어있지 않습니다.'})
        return
      }

      const file = new AttachmentBuilder(`asset/${gem_name}-export.png`,{name:'item.png'})
      const info = ItemData[gem_name]
      const tier = {'epic':'상급','rare':'중급','common':'하급','none':'없음','unknown':'알 수 없음'}
      const per = {'epic':'0.8','rare':'3.5','common':'7.8','none':'없음','unknown':'0.3'}
      const embed = new EmbedBuilder()
        .setTitle(gem_name)
        .setColor('Blurple')
        .setThumbnail('attachment://item.png')
        .setDescription(
          `- 희귀도: ${tier[info.tier]}\n`+
          `- 획득 확률: 약 **${per[info.tier]}%**\n\n`+
          `**${info.description[0]}**\n\n`+
          `${info.description[1]}`
        )

      await interaction.reply({embeds:[embed],files:[file]})

      return
    }

    //이미지 생성
    const canvas = createCanvas(384,272)
    const context = canvas.getContext('2d')
    const background = await loadImage('asset/도감-export.png')
    context.drawImage(background,0,0)

    const gem_list = Object.keys(ItemData).slice(6)
    
    let common = []
    let rare = []
    let epic = []
    let unknown = []

    for(const gem of gem_list){
      let gem_pic
      if(gem_listed.indexOf(gem)==-1){
        gem_pic = await loadImage(`asset/unknown.png`)
      }else{
        gem_pic = await loadImage(`asset/${gem}.png`)
        
        switch (ItemData[gem].tier) {
          case 'common':
            common.push(gem)
            break;
          case 'rare':
            rare.push(gem)
            break;
          case 'epic':
            epic.push(gem)
            break;
          case 'unknown':
            unknown.push(gem)
            break;
        }
      }
      const position = ItemData[gem].position
      context.drawImage(gem_pic,position[0],position[1])
    }

    const embed = new EmbedBuilder()
      .setTitle('도감')
      .setColor('Blurple')
      .setImage('attachment://item.png')
      .setDescription(`<@${interaction.user.id}>`+'님이 현재까지 수집한 보석입니다\n\n'+
        `수집 진척도(${Math.floor(gem_listed.length/gem_list.length*100)}%) |${makeBar(gem_listed.length,gem_list.length,10)}| [${gem_listed.length}/${gem_list.length}]`
      )
      .addFields(
        {name:'하급 보석', value:`${common.length===0?'수집한 보석이 없습니다':common.join(', ')}`},
        {name:'중급 보석', value:`${rare.length===0?'수집한 보석이 없습니다':rare.join(', ')}`},
        {name:'상급 보석', value:`${epic.length===0?'수집한 보석이 없습니다':epic.join(', ')}`},
        {name:'???', value:`${unknown.length===0?'수집한 보석이 없습니다':unknown.join(', ')}`}
      )
      .setFooter({text:'/도감 [보석] 명령어로 세부 정보를 확인해보세요!'})
    const file = new AttachmentBuilder(await canvas.encode('png'),{name:'item.png'})
    await interaction.reply({embeds:[embed],files:[file]})   
  }
}