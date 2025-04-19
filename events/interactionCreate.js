const { Events } = require('discord.js');
const Database = require('better-sqlite3')

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {

		//Slash Commands
		if (interaction.isChatInputCommand()){
			const command = interaction.client.commands.get(interaction.commandName);
			if (!command) {
				console.error(`No Slash command matching ${interaction.commandName} was found.`);
				return;
			}

			if(['시작하기','채널설정'].indexOf(interaction.commandName)==-1){
				const db = new Database('DB/user.db')
				const find = db.prepare('SELECT * FROM user WHERE user_id=? AND server=?').get(interaction.user.id,interaction.guildId)
				db.close
				if(!find){
					interaction.reply({content:'⚠️ 해당 명령어는 등록된 회원만 사용 가능합니다.\n\'/시작하기\' 명령어로 정보를 등록해주세요.',ephemeral:true})
					return
				}
			}
			
			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: '⚠️명령 실행 중 오류가 발생했습니다!', ephemeral: true });
				} else {
					await interaction.reply({ content: '⚠️명령 실행 중 오류가 발생했습니다!', ephemeral: true });
				}
			}
		}

		//autocomplete
		if(interaction.isAutocomplete()){
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.autocomplete(interaction);
			} catch (error) {
				console.error(error);
			}
		}

		//Modal
		if(interaction.isModalSubmit()){
			const command = interaction.client.interactions.modal.get(interaction.customId);
			if(!command) {
				console.error(`No Modal command matching ${interaction.customId} was found.`);
				return;
			}
			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: '⚠️명령 실행 중 오류가 발생했습니다!', ephemeral: true });
				} else {
					await interaction.reply({ content: '⚠️명령 실행 중 오류가 발생했습니다!', ephemeral: true });
				}
			}
		}

		//Button
		if(interaction.isButton()){
			const customId= interaction.customId.split('-')

			//customId에 유저 id 포함
			if(customId.length >= 2){
				if(customId[1]!==interaction.user.id){
					interaction.reply({content:"해당 버튼을 사용할 수 있는 권한이 없습니다.",ephemeral:true})
					return
				}
			}

			const command = interaction.client.interactions.button.get(customId[0]);
			if(!command) {
				console.error(`No Button command matching ${customId[0]} was found.`);
				return;
			}
			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: '⚠️명령 실행 중 오류가 발생했습니다!', ephemeral: true });
				} else {
					await interaction.reply({ content: '⚠️명령 실행 중 오류가 발생했습니다!', ephemeral: true });
				}
			}
		}

		//StringSelectMenu
		if(interaction.isStringSelectMenu()){
			const customId= interaction.customId.split('-')

			//customId에 유저 id 포함
			if(customId.length >= 2){
				if(customId[1]!==interaction.user.id){
					interaction.reply({content:"해당 버튼은 메뉴 생성 유저만 상호작용 가능합니다.",ephemeral:true})
					return
				}
			}

			const command = interaction.client.interactions.stringselectmenu.get(customId[0]);
			if(!command) {
				console.error(`No StringSelectMenu command matching ${customId[0]} was found.`);
				return;
			}
			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: '⚠️명령 실행 중 오류가 발생했습니다!', ephemeral: true });
				} else {
					await interaction.reply({ content: '⚠️명령 실행 중 오류가 발생했습니다!', ephemeral: true });
				}
			}
		}

	},
};
