const { EmbedBuilder } = require('discord.js')

module.exports = {
  name:"cancel",
  async execute(interaction){

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle('탈퇴 절차가 취소되었습니다')
      .setDescription('그대로 남아주셔서 감사합니다.\n최고의 보석 사냥꾼이 되기 위한 모험을 다시 한번 떠나보세요!')

    await interaction.update({embeds:[embed],components:[]})
  }
}