function fungsinya(
  client,
  socket,
  qrcode,
  checkRegisteredNumber,
  MessageMedia,
  axios,
  id,
  stat,
  app,
  mulai,
  arrayRemove
) {
  setInterval(function () {
    try {
      stat(client, socket, id);
    } catch (e) {
      socket.emit("message", { id: id, message: "Gagal memuat status..." });
    }
  }, 60000);

  client.on("qr", (qr) => {
    console.log("id=", id);
    // qrcode.generate(qr, { small: true });
    socket.emit("message", { id: id, message: "Silahkan scan di sini!" });
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit("qr", { id: id, src: url });
      socket.emit("dqr", { id: id, dqr: 1 });
      socket.emit("loading", { id: id, loading: 0 });
      console.log("QR RECEIVED", qr);
    });
  });

  socket.on("cekstatus", function (data) {
    if (data.id == "server") {
      try {
        stat(client, socket, data.id);
      } catch (e) {
        socket.emit("message", { id: id, message: "Gagal memuat status..." });
      }
    }
  });

  client.on("loading_screen", (percent, message) => {
    console.log("LOADING SCREEN " + id + " ", percent, message);
    socket.emit("message", {
      id: id,
      message: "LOADING SCREEN " + percent + "%.\n" + message,
    });
    socket.emit("loading", { id: id, loading: 1 });

    socket.emit("dqr", { id: id, dqr: 0 });
  });

  client.on("authenticated", () => {
    console.log(id + " AUTHENTICATED");
    socket.emit("message", { id: id, message: "Terotentikasi..." });
    socket.emit("loading", { id: id, loading: 0 });
  });

  client.on("auth_failure", (msg) => {
    // Fired if session restore was unsuccessful
    console.error("AUTHENTICATION FAILURE", msg);
    socket.emit("message", { id: id, message: "Otentikasi Gagal! " + msg });
    socket.emit("loading", { id: id, loading: 0 });
  });

  client.on("ready", () => {
    console.log(id + " READY");
    socket.emit("message", { id: id, message: "Whatsapp Bot berjalan..." });
    socket.emit("dqr", { id: id, dqr: 0 });
    socket.emit("loading", { id: id, loading: 0 });
    socket.emit("logout", { id: id, logout: 1 });
  });

  client.on("disconnected", (reason) => {
    console.log("Client was logged out", reason);
    socket.emit("message", {
      id: id,
      message: "Anda telah logout..." + reason,
    });
    // socket.emit('dqr', { id: id, dqr: '1' });
    socket.emit("loading", { id: id, loading: 1 });
    socket.emit("logout", { id: id, logout: 0 });
    client.destroy();
    client.initialize();
    arrayRemove(id);
    socket.emit("restart", "yes");
  });

  /* process.on("SIGINT", async () => {
     console.log("(SIGINT) Shutting down...");
     await client.destroy();
     process.exit(0);
    }) */

  client.on("message", async (msg) => {
    // console.log('MESSAGE RECEIVED', msg);
    console.log("MESSAGE RECEIVED SERVER : ", id);

    if (msg.body === "!ping reply") {
      // Send a new message as a reply to the current one
      msg.reply("pong" + id);
    } else if (msg.body === "ping") {
      // Send a new message to the same chat
      client.sendMessage("628567148813@c.us", "pong" + id);
      socket.emit("message", { id: id, message: "pong" });
    } else if (msg.body.startsWith("!sendto ")) {
      // Direct send a new message to specific id
      //!sendto 628567148813 Test
      let number = msg.body.split(" ")[1];
      let messageIndex = msg.body.indexOf(number) + number.length;
      let message = msg.body.slice(messageIndex, msg.body.length);
      number = number.includes("@c.us") ? number : `${number}@c.us`;
      let chat = await msg.getChat();
      chat.sendSeen();
      client.sendMessage(number, message);
    } else if (msg.body.startsWith("!subject ")) {
      // Change the group subject
      let chat = await msg.getChat();
      if (chat.isGroup) {
        let newSubject = msg.body.slice(9);
        chat.setSubject(newSubject);
      } else {
        msg.reply("This command can only be used in a group!");
      }
    } else if (msg.body.startsWith("!echo ")) {
      // Replies with the same message
      msg.reply(msg.body.slice(6));
    } else if (msg.body.startsWith("!desc ")) {
      // Change the group description
      let chat = await msg.getChat();
      if (chat.isGroup) {
        let newDescription = msg.body.slice(6);
        chat.setDescription(newDescription);
      } else {
        msg.reply("This command can only be used in a group!");
      }
    } else if (msg.body === "!leave") {
      // Leave the group
      let chat = await msg.getChat();
      if (chat.isGroup) {
        chat.leave();
      } else {
        msg.reply("This command can only be used in a group!");
      }
    } else if (msg.body.startsWith("!join ")) {
      const inviteCode = msg.body.split(" ")[1];
      try {
        await client.acceptInvite(inviteCode);
        msg.reply("Joined the group!");
      } catch (e) {
        msg.reply("That invite code seems to be invalid.");
      }
    } else if (msg.body === "!groupinfo") {
      let chat = await msg.getChat();
      if (chat.isGroup) {
        msg.reply(`
                        *Group Details*
                        Name: ${chat.name}
                        Description: ${chat.description}
                        Created At: ${chat.createdAt.toString()}
                        Created By: ${chat.owner.user}
                        Participant count: ${chat.participants.length}
                    `);
      } else {
        msg.reply("This command can only be used in a group!");
      }
    } else if (msg.body === "!chats") {
      const chats = await client.getChats();
      client.sendMessage(msg.from, `The bot has ${chats.length} chats open.`);
    } else if (msg.body === "!info") {
      let info = client.info;
      client.sendMessage(
        msg.from,
        `
                    *Connection info*
                    User name: ${info.pushname}
                    My number: ${info.wid.user}
                    Platform: ${info.platform}
                `
      );
    } else if (msg.body === "!mediainfo" && msg.hasMedia) {
      const attachmentData = await msg.downloadMedia();
      msg.reply(`
                    *Media info*
                    MimeType: ${attachmentData.mimetype}
                    Filename: ${attachmentData.filename}
                    Data (length): ${attachmentData.data.length}
                `);
    } else if (msg.body === "!quoteinfo" && msg.hasQuotedMsg) {
      const quotedMsg = await msg.getQuotedMessage();
      quotedMsg.reply(`
                    ID: ${quotedMsg.id._serialized}
                    Type: ${quotedMsg.type}
                    Author: ${quotedMsg.author || quotedMsg.from}
                    Timestamp: ${quotedMsg.timestamp}
                    Has Media? ${quotedMsg.hasMedia}
                `);
    } else if (msg.body === "!resendmedia" && msg.hasQuotedMsg) {
      const quotedMsg = await msg.getQuotedMessage();
      if (quotedMsg.hasMedia) {
        const attachmentData = await quotedMsg.downloadMedia();
        client.sendMessage(msg.from, attachmentData, {
          caption: "Here's your requested media.",
        });
      }
    } else if (msg.body === "!location") {
      msg.reply(
        new Location(37.422, -122.084, "Googleplex\nGoogle Headquarters")
      );
    } else if (msg.location) {
      msg.reply(msg.location);
    } else if (msg.body.startsWith("!status ")) {
      const newStatus = msg.body.split(" ")[1];
      await client.setStatus(newStatus);
      msg.reply(`Status was updated to *${newStatus}*`);
    } else if (msg.body === "!mention") {
      const contact = await msg.getContact();
      const chat = await msg.getChat();
      chat.sendMessage(`Hi @${contact.number}!`, {
        mentions: [contact],
      });
    } else if (msg.body === "!delete") {
      if (msg.hasQuotedMsg) {
        const quotedMsg = await msg.getQuotedMessage();
        if (quotedMsg.fromMe) {
          quotedMsg.delete(true);
        } else {
          msg.reply("I can only delete my own messages");
        }
      }
    } else if (msg.body === "!pin") {
      const chat = await msg.getChat();
      await chat.pin();
    } else if (msg.body === "!archive") {
      const chat = await msg.getChat();
      await chat.archive();
    } else if (msg.body === "!mute") {
      const chat = await msg.getChat();
      // mute the chat for 20 seconds
      const unmuteDate = new Date();
      unmuteDate.setSeconds(unmuteDate.getSeconds() + 20);
      await chat.mute(unmuteDate);
    } else if (msg.body === "!typing") {
      const chat = await msg.getChat();
      // simulates typing in the chat
      chat.sendStateTyping();
    } else if (msg.body === "!recording") {
      const chat = await msg.getChat();
      // simulates recording audio in the chat
      chat.sendStateRecording();
    } else if (msg.body === "!clearstate") {
      const chat = await msg.getChat();
      // stops typing or recording in the chat
      chat.clearState();
    } else if (msg.body === "!jumpto") {
      if (msg.hasQuotedMsg) {
        const quotedMsg = await msg.getQuotedMessage();
        client.interface.openChatWindowAt(quotedMsg.id._serialized);
      }
    } else if (msg.body === "!buttons") {
      let button = new Buttons(
        "Button body",
        [{ body: "bt1" }, { body: "bt2" }, { body: "bt3" }],
        "title",
        "footer"
      );
      client.sendMessage(msg.from, button);
    } else if (msg.body === "!list") {
      let sections = [
        {
          title: "sectionTitle",
          rows: [
            { title: "ListItem1", description: "desc" },
            { title: "ListItem2" },
          ],
        },
      ];
      let list = new List("List body", "btnText", sections, "Title", "footer");
      client.sendMessage(msg.from, list);
    } else if (msg.body === "!reaction") {
      msg.react("👍");
    }
  });
}
module.exports = {
  fungsinya,
};
