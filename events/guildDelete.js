const { Events } = require("discord.js");
const Database = require('better-sqlite3')

module.exports = {
  name:Events.GuildDelete,
  async execute(guild){
    const id = guild.id
    const db = new Database('DB/user.db')
    
    //user에서 삭제
    db.prepare('DELETE FROM user WHERE server=?')
      .run(id)
    //inventory에서 삭제 
    db.prepare('DELETE FROM inventory WHERE server=?')
      .run(id)
    //break에서 삭제
    db.prepare('DELETE FROM break WHERE server=?')
      .run(id)
    //dex에서 삭제
    db.prepare('DELETE FROM dex WHERE server=?')
      .run(id)
    //channel에서 삭제
    db.prepare('DELETE FROM channel WHERE server=?')
      .run(id)
    //reward에서 삭제
    db.prepare('DELETE FROM reward WHERE server=?')
      .run(id)

    db.close()

  }
}