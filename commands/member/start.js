const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Database = require('better-sqlite3')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('시작하기')
		.setDescription('새로운 보석 수집가로서의 모험을 시작합니다.')
    .setDMPermission(false),
	async execute(interaction) {

    const db = new Database('DB/user.db')
    const find = db.prepare('SELECT * FROM user WHERE user_id=? AND server=?')
    const user = find.get(interaction.user.id,interaction.guildId)

    //동일 회원 존재여부 확인
    if (user){
      db.close()
      await interaction.reply({ephemeral:true,content:'⚠️ 이미 등록이 되어있습니다.'})
      return
    }

    const insert = db.prepare('INSERT INTO user (user_id,server) VALUES (?,?)')
    insert.run(interaction.user.id,interaction.guildId)
    db.close

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle("🥳 서버에 새로운 보석 수집가가 등장했습니다!")
      .setDescription("돌 속에 숨겨진 보석을 찾아내는 수집가들의 세계에 오신 것을 환영합니다.\n"+
        "채팅을 통해 돌 조각을 부수고, 그 속에 숨겨진 진귀한 보석들을 찾아내세요.")
      .addFields(
        {name:"⛏️ 어떻게 플레이하나요?", value:"- 상점에서 돌 조각을 얻어보세요.\n- `/세공하기`로 돌 조각과 원석 세공을 시작하세요.\n- 서버에서 채팅을 치며 보석을 세공하세요."},
        {name:"💎 수집한 보석은 어떻게 확인하나요?", value:"- 획득한 보석은 `/보관함`에서 확인할 수 있습니다.\n- 최초로 얻은 보석은 `/도감등록`으로 도감에 등록이 가능합니다.\n- 남은 보석은 `/상점`에서 원석으로 교환하실 수 있습니다."},
        {name:'❓ 어떤 명령어가 있나요?', value:'- `/도움말` 명령어를 참고해주세요!'}
      )

		await interaction.reply({embeds:[embed]});
	},
};
