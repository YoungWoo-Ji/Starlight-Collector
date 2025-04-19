const { Events, EmbedBuilder, PermissionsBitField } = require("discord.js");
const {clientId} =require('../config.json')

module.exports = {
  name:Events.GuildCreate,
  async execute(guild){
    const appName = '별빛 수집가' //어플이름
    const discord_link = 'https://discord.gg/mTBbw9TaaP'

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle(`💎 ${guild.name} 서버에 초대해주셔서 감사합니다!`)
      .addFields(
        {name:'❓ 이건 무슨 앱인가요?',value:`${appName}는 디스코드에서 원석을 얻고, 세공하며,\n보석 도감을 채우는 어플입니다!`},
        {name:'❓ 어떻게 시작하나요?', value:'`/시작하기` 를 입력해주세요!'},
        {name:'❓ 어떤 명령어가 있나요?', value:'`/도움말` 을 참고해주세요!'},
        {name:'❗ 도움이 필요해요!', value:'어플관련 알림이 제공될 채널을 선택해주세요!\n`/채널설정` 명령어로 선택할 수 있습니다.\n(관리자 권한이 있는 유저만 사용가능한 명령어입니다.)'},
        {name:'🌍 공식 디스코드 서버',value:`[여기를 클릭하세요!](${discord_link})`}
      )
      .setTimestamp()

    const botMember = await guild.members.fetch(clientId)
  
    const textChannels = guild.channels.cache            
      .filter(ch => ch.isTextBased() && !ch.isVoiceBased() && ch.permissionsFor(botMember).has(PermissionsBitField.Flags.SendMessages));

    for (const channel of textChannels.values()) {
      try {
          // 채널에 환영 메시지 보내기
          await channel.send({embeds:[embed]});
          break; // 메시지 전송에 성공하면 루프 종료
      } catch (error) {
          //패스
      }
    }
  }
}