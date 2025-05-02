const { SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { clientId, kbot_token } = require('../../config.json')
const client = require('../../client');
const Database = require("better-sqlite3");
module.exports = {
  data: new SlashCommandBuilder()
    .setName('하트보상')
    .setDescription('하트를 투표하고 보상을 받으세요!')
    .setDMPermission(false),
  async execute(interaction){

    const url = `https://koreanbots.dev/api/v2/bots/${clientId}/vote?userID=${interaction.user.id}`
    
    await interaction.deferReply()
    
    const res = await fetch(url,{
      method:'GET',
      headers:{
        "Authorization": kbot_token,
        'Content-Type': "application/json"
      }
    })
    
    //임베드
    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setTimestamp()

    //200
    if(res.status===200){
      const {data} = await res.json()
      const {voted,lastVote} = data
      //투표하지 않음
      if(!voted){
        embed
          .setTitle('🌟 별빛 수집가에 투표하고 보상을 받으세요!')
          .setDescription('아직 별빛 수집가에 투표하지 않으셨군요!\n'+
            '한국 디스코드 리스트에서 별빛 수집가에 투표하시면 보상을 드립니다!\n'+
            '투표 후 명령어를 다시 입력해주세요~😄')
          .setThumbnail(client.user.avatarURL())
        const link = new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setEmoji('♥️')
          .setLabel('투표하기')
          .setURL('https://koreanbots.dev/bots/'+clientId+'/vote')
          
        await interaction.followUp({embeds:[embed], components:[new ActionRowBuilder().addComponents(link)]})
      }
      //투표함
      else{

        //이미 보상 받았는지 확인
        const db = new Database('DB/user.db')
        const user = interaction.user.id
        const server = interaction.guildId
        const rewarded = db.prepare('SELECT * FROM reward WHERE user_id = ? AND server=? AND lastVote=?')
          .get(user,server,lastVote)
        if(rewarded){
          const next_vote = new Date(lastVote+12*60*60_000)
          embed
            .setTitle('🤗 이미 투표보상을 받았습니다.')
            .setDescription('이미 투표 보상을 받으셨습니다.\n다시 투표하신 후에 보상을 신청하세요.')
            .addFields({name:'다음 투표가능 시간',value:`${next_vote.getMonth()+1}월 ${next_vote.getDate()}일 ${next_vote.getHours()}시 ${next_vote.getMinutes()}분`})

          db.close()
          await interaction.followUp({embeds:[embed]})
          return
        }
        
        const value = Math.random()
        let reward, count
        if(value<=0.97){
          reward = '하급원석'
          count = 1+Math.floor(Math.random()*3)
        }else{
          reward ='수상한 원석'
          count = 1
        }
        //아이템 추가
        const find_item = db.prepare("SELECT * FROM inventory WHERE user_id=? AND server=? AND item=?")
          .get(user,server,reward)
        if(find_item){
          db.prepare(`UPDATE inventory SET count=count+${count} WHERE user_id=? AND server=? AND item=?`)
            .run(user,server,reward)
        }else{
          db.prepare("INSERT INTO inventory (user_id,server,item,count) VALUES (?,?,?,?)")
            .run(user,server,reward,count)
        }

        //보상 지급 기록
        const find_record = db.prepare("SELECT * FROM reward WHERE user_id=? AND server=?")
          .get(user,server)
        if(find_record){
          db.prepare(`UPDATE reward SET lastVote=? WHERE user_id=? AND server=?`)
            .run(lastVote,user,server)
        }else{
          db.prepare("INSERT INTO reward (user_id,server,lastVote) VALUES (?,?,?)")
            .run(user,server,lastVote)
        }

        db.close()
        embed
          .setTitle('♥️ 투표 보상을 획득하셨습니다!')
          .setDescription(`<@${interaction.user.id}> 님 투표해주셔서 감사합니다.\n보상으로 다음 아이템이 지급되었습니다!`)
          .addFields(
            {name:'투표보상',value:`${reward} x ${count}`}
          )
          .setThumbnail('attachment://item.png')
        const file = new AttachmentBuilder(`asset/${reward}-export.png`,{name:'item.png'})
        await interaction.followUp({embeds:[embed],files:[file]})
      }
    //200 외
    }else{
      embed
        .setTitle('❌ API에 문제가 발생했습니다.')
        .setDescription('요청을 처리하는 중 문제가 발생했습니다.\n잠시후 다시 시도해주세요.')
      //이미지 물러올 수 있는지 확인
      const imageUrl = `https://http.cat/${res.status}`
      const res2 = await fetch(imageUrl, { method: 'HEAD' }); // HEAD 요청으로 확인만
      if(res2.status===200){
        embed.setImage(imageUrl)
      }
      await interaction.followUp({embeds:[embed]})
    }
  }
}
