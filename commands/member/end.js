const { SlashCommandBuilder, EmbedBuilder,ActionRowBuilder,ButtonBuilder,ButtonStyle } = require("discord.js");
const Database = require('better-sqlite3')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('그만두기')
		.setDescription('보석 수집을 그만둡니다.')
    .setDMPermission(false),
	async execute(interaction) {
    const db = new Database('DB/user.db')
    const find = db.prepare('SELECT * FROM user WHERE user_id=? AND server=?')
    const user = find.get(interaction.user.id,interaction.guildId)
    db.close()
    //동일 회원 존재여부 확인
    if (!user){
      await interaction.reply({ephemeral:true,content:'⚠️ 등록되어있지 않습니다.'})
      return
    }

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle("정말로 그만두시겠습니까?")
      .setDescription('탈퇴 시 모든 데이터는 삭제되고, 이는 복구할 수 없습니다.')
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`cancel-${interaction.user.id}`)
          .setLabel('아니요')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('confirm-'+interaction.user.id)
          .setLabel('네')
          .setStyle(ButtonStyle.Secondary)
      )
    
    interaction.reply({embeds:[embed],components:[row]})
  }
}