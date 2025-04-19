const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('도움말')
		.setDescription('어플의 모든 명령어를 확인합니다.')
    .setDMPermission(false),
	async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle('❓ 도움말')
      .setDescription('어플의 모든 명령어입니다.')
      .addFields(
        {name:'💎 보석 관련',value:
          '`/세공하기 [이름]`: 각종 원석의 세공을 시작합니다.\n'+
          '`/세공상태`: 세공 진행상태를 살펴봅니다.\n'+
          '`/분해하기`: 보석을 분해해 보석 조각을 얻습니다.\n'+
          '`/도감`: 현재까지 모은 보석 목록을 확인합니다.\n'+
          '`/도감등록`: 모은 보석을 도감에 등록합니다.\n'
        },
        {name:'🧺 소지품 관련',value:
          '`/보관함`: 소지하고 있는 물품을 확인합니다.\n'+
          '`/감정하기`: 소지하고 있는 물품을 살펴봅니다.\n'+
          '`/상점`: 다양한 물품을 거래합니다.\n'+
          '`/거래`: 유저간 물품을 거래합니다.'
        },
        {name:'👤 회원 관련',value:
          '`/시작하기`: 회원 정보를 등록합니다\n'+
          '`/그만두기`: 모든 회원 정보를 삭제합니다\n'+
          '`/프로필`: 내 정보를 확인합니다.'
        },
        {
          name:'🎸 기타',
          value:'`/채널설정`: 알림 채널과 부스터 채널을 설정합니다. **(서버 관리자 전용)**'
        }
      )
    await interaction.reply({embeds:[embed]})
  } 
}