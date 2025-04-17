const Database = require("better-sqlite3");
const { SlashCommandBuilder, EmbedBuilder,ActionRowBuilder,ButtonBuilder,ButtonStyle } = require("discord.js");
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
		.setName('프로필')
		.setDescription('내 정보를 확인합니다.')
    .setDMPermission(false),
	async execute(interaction) {
    const db = new Database('DB/user.db')
    const id = interaction.user.id
    const server = interaction.guildId
    const dex = db.prepare('SELECT * FROM dex WHERE user_id=? AND server=?')
      .all(id,server)
    db.close()
    const gem_listed = dex.map(e=>e.gem)
    const gem_count = gem_listed.length
    const gem_total = Object.keys(ItemData).length-6
    let unknown = 0
    let epic = 0
    let rare = 0
    let common = 0

    for(gem of gem_listed){
      switch (ItemData[gem].tier) {
        case 'common':
          common+=1
          break;
        case 'rare':
          rare+=1
          break;
        case 'epic':
          epic+=1
          break;
        case 'unknown':
          unknown+=1
          break;
      }
    }

    const per = gem_count/gem_total*100
    const rate= ['🪨 입문 수집가', '⛏️ 초보 수집가', '⚒️ 전문 수집가', '💎 위대한 수집가', '👑 전설의 수집가', '🌟 별빛 수집가'][Math.floor(per/20)]

    const embed = new EmbedBuilder()
      .setTitle(`${interaction.member.displayName} 님의 프로필`)
      .setColor('Blurple')
      .setThumbnail(interaction.user.avatarURL())
      .setDescription(
        `- 수집가 등급: ${rate}\n`+
        `- 수집 진행도(${Math.floor(per)}%) |${makeBar(gem_count,gem_total,10)}|[${gem_count}/${gem_total}]\n`
      )
      .addFields({name:'수집한 보석',value:
        `- 하급: ${common}개\n`+
        `- 중급: ${rare}개\n`+
        `- 상급: ${epic}개\n`+
        `- ???: ${unknown}개`
      })
    await interaction.reply({embeds:[embed]})
      
  }
}