const { Events, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Database = require('better-sqlite3')
const ItemData = require('../GameData/items.json')
const GemData = require('../GameData/gems.json')
const client = require('../client')

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    //봇 무시
    if(message.author.bot) return

    const id = message.author.id
    const server = message.guildId
    const channel = message.channelId

    const db = new Database('DB/user.db')
    const find = db.prepare("SELECT * FROM break WHERE user_id=? AND server=?")
      .get(id,server)
    
    if(!find) return

    const is_boost = db.prepare('SELECT * FROM channel WHERE server=? AND channel=? AND boost=?')
      .get(server,channel,1)
    
    let add_count = 1
    if(is_boost) add_count=2

    const update = db.prepare("UPDATE break SET count=count+? WHERE user_id=? AND server=?")
      .run(add_count,id,server)
    
    //세공 완료
    if(ItemData[find.item].count <= find.count+1){
      const d_item = db.prepare("DELETE FROM break WHERE user_id=? AND server=?")
        .run(id,server)
      let result
      switch (find.item) {
        case '돌 조각':
          const ran = Math.random()
          if(ran<=0.7){
            result='하급원석'
          }else if(ran<=0.95){
            result='중급원석'
          }else if(ran<=0.99){
            result='상급원석'
          }else{
            result='수상한 원석'
          }
          break;
        case '하급원석':
          result = GemData['common'][Math.floor(Math.random()*GemData['common'].length)]
          break;
        case '중급원석':
          result = GemData['rare'][Math.floor(Math.random()*GemData['rare'].length)]
          break;
        case '상급원석':
          result = GemData['epic'][Math.floor(Math.random()*GemData['epic'].length)]
          break;
        case '수상한 원석':
          result = GemData['unknown'][Math.floor(Math.random()*GemData['unknown'].length)]
          break;
      }
      
      //아이템 추가
      const find_item = db.prepare('SELECT * FROM inventory WHERE user_id=? AND server=? AND item=?')
        .get(id,server,result)
      
      //아이템 이미 소지
      if(find_item){
        db.prepare("UPDATE inventory SET count=count+1 WHERE user_id=? AND server=? AND item=?")
          .run(id,server,result)
      }
      //아이템 소지 하지 않음
      else{
        db.prepare("INSERT INTO inventory (user_id,server,item) VALUES (?,?,?)")
          .run(id,server,result)
      }

      //메시지 보내기
      let channels = db.prepare("SELECT channel FROM channel WHERE server=?").all(server)
      const tier = {'epic':'상급','rare':'중급','common':'하급','none':'없음','unknown':'알 수 없음'}
      const embed = new EmbedBuilder()
        .setTitle('🎉 세공이 완료되었습니다')
        .setColor('Blurple')
        .setDescription(
          `<@${id}>님 ${find.item} 세공이 완료되었어요!\n\n`+
          `- 세공 결과물: ${result}\n`+
          `- 등급: ${tier[ItemData[result].tier]}\n`+
          `- 채팅횟수: ${ItemData[find.item].count}회`
        )
        .setTimestamp()
        .setThumbnail('attachment://item.png')
      const file = new AttachmentBuilder(`asset/${result}-export.png`,{name:'item.png'})
      
      if(channels.length===0) channels.push({channel:message.channelId})
      for(const _channel of channels){
        try{
          const guild = client.guilds.cache.get(server)
          const channel = guild.channels.cache.get(_channel.channel)
          await channel.send({embeds:[embed],files:[file]})
        }catch(e){
          //실패
        }
      }

      //도감 등록 여부
      if(['수상한 원석','상급원석','중급원석','하급원석'].indexOf(result)===-1){
        const is_gem_exist=db.prepare('SELECT * FROM dex WHERE user_id=? AND server=? AND gem=?').get(id,server,result)
        if(!is_gem_exist){
          const total_collect = db.prepare('SELECT * FROM dex WHERE user_id=? AND server=?').all(id,server).length
          const total = Object.keys(ItemData).length-6
          const embed2 = new EmbedBuilder()
            .setColor('Blurple')
            .setTimestamp()
            .setTitle('🎉 새로운 보석을 발견했습니다!')
            .setDescription(`<@${id}>님 도감에 등록되지 않은 새로운 보석을 찾았어요!\n\n\`/도감등록\` 명령어로 **${result}**을(를) 도감에 등록해보세요!\n\n`)
            .setThumbnail('attachment://item.png')
          const file2 = new AttachmentBuilder(`asset/${result}-export.png`,{name:'item.png'})
          for(const _channel of channels){
            try{
              const guild = client.guilds.cache.get(server)
              const channel = guild.channels.cache.get(_channel.channel)
              await channel.send({embeds:[embed2],files:[file2]})
            }catch(e){
              //실패
            }
          }

        }
      }

    }
    db.close()
  }
}