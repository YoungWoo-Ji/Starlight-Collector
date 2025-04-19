const Database = require('better-sqlite3');
const { Events, ActivityType } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {

		// 상태 설정
		client.user.setPresence({
			activities: [{
				name:'/시작하기 를 입력해보세요!',
				type: ActivityType.Custom
			}],
			status:'online'
		})

		// 거래내역 삭제
		const db = new Database('DB/user.db')
		db.prepare('DELETE FROM trade').run()
		db.close()
		console.log('Cleared all trade data')

		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};
