function routingnya(
  body,
  validationResult,
  phoneNumberFormatter,
  app,
  klien,
  MessageMedia,
  axios
) {
  const checkRegisteredNumber = async function (number, client) {
    const isRegistered = await client.isRegisteredUser(number);
    return isRegistered;
  };

  app.get("/", (req, res) => {
    res.sendFile("index.html", { root: __dirname });
  });

  app.get(
    "/send-message",
    [body("number").notEmpty(), body("message").notEmpty()],
    async (req, res) => {
      try {
        const email = req.query.email;
        const token = req.query.token;

        const id = req.query.id;
        const number = phoneNumberFormatter(req.query.number);
        const pesan = req.query.message;
        const client = klien.find((sess) => sess.id == id).client;

        console.log(
          process.env.serverwa +
            "/api/cektoken?email=" +
            email +
            "&token=" +
            token
        );

        /* try {
        const isRegisteredNumber = await client.isRegisteredUser(number);
        console.log(isRegisteredNumber);
        } catch (err) {
          console.log("Nomor " + number + " tidak teregister!");
          res.status(422).json({
            status: false,
            message: String(err),
          });
        } */

        axios
          .get(
            process.env.serverwa +
              "/api/cektoken?email=" +
              email +
              "&token=" +
              token
          )
          .then((response) => {
            let children = response.data;
            let status = children.status;
            let message = children.message;
            console.log("[Status = " + status + "] " + message);

            if (status == true) {
              // client.sendMessage('628567148813@c.us', number + '=' + message);
              /*  res.status(200).json({
              status: true,
              message: message + ". Mulai mengirim pesan.",
            }); */

              client
                .sendMessage(number, pesan)
                .then((response) => {
                  res.status(200).json({
                    status: true,
                    message: message + ". Mengirim pesan.",
                  });
                })
                .catch((err) => {
                  res.status(500).json({
                    status: false,
                    message: String(err),
                  });
                });
            } else {
              res.status(422).json({
                status: status,
                message: message,
              });
            }
          })
          .catch((error) => {
            console.log("err = ", error);
            res.status(422).json({
              status: false,
              message: String(error),
            });
          });
      } catch (error) {
        console.log("err = ", error);
        res.status(422).json({
          status: false,
          message: String(error),
        });
      }
    }
  );

  //send message API
  app.post(
    "/send-message",
    [body("number").notEmpty(), body("message").notEmpty()],
    async (req, res) => {
      try {
        const errors = validationResult(req).formatWith(({ msg }) => {
          return msg;
        });
        if (!errors.isEmpty()) {
          return res.status(422).json({
            status: false,
            message: errors.mapped(),
          });
        }
        const id = req.body.id;
        const number = phoneNumberFormatter(req.body.number);
        const message = req.body.message;
        const client = klien.find((sess) => sess.id == id).client;

        try {
          const isRegisteredNumber = await checkRegisteredNumber(number);
        } catch (err) {
          res.status(422).json({
            status: false,
            message: "Nomor tidak teregister!",
          });
        }

        client.sendMessage("628567148813@c.us", number);
        /* client.sendMessage(number, message).then(response => {
                res.status(200).json({
                    status: true,
                    message: response
                });
                console.log("Ada pesan wa!!!");
            }).catch(err => {
                res.status(500).json({
                    status: false,
                    message: number + '=' + message
                });
                console.log("Gagal mengirim wa!!!");
            }); */
      } catch (error) {
        console.log("err = ", error);
        res.status(422).json({
          status: false,
          message: String(error),
        });
      }
    }
  );

  //send media url
  app.post("/send-media-url", async (req, res) => {
    try {
      const redirect = String(req.body.redirect);
      const id = String(req.body.id);
      console.log(id);
      const number = phoneNumberFormatter(String(req.body.number));
      const caption = req.body.caption;
      const client = klien.find((sess) => sess.id == id).client;
      const fileurl = String(req.body.fileurl);
      const media = await MessageMedia.fromUrl(fileurl);
      const email = req.body.email;
      const token = req.body.token;

      console.log(
        process.env.serverwa +
          "/api/cektoken?email=" +
          email +
          "&token=" +
          token
      );

      axios
        .get(
          process.env.serverwa +
            "/api/cektoken?email=" +
            email +
            "&token=" +
            token
        )
        .then((response) => {
          let children = response.data;
          let status = children.status;
          let message = children.message;
          console.log("[Status = " + status + "] " + message);

          if (status == true) {
            /* const errors = validationResult(req).formatWith(({ msg }) => {
            return msg;
          });
          if (!errors.isEmpty()) {
            return res.status(422).json({
              status: false,
              message: errors.mapped(),
            });
          } */

            /* let mimetype;
          const attachment = axios
            .get(fileUrl, { responseType: "arraybuffer" })
            .then((response) => {
              mimetype = response.headers["content-type"];
              return response.data.toString("base64");
            });
          const media = new MessageMedia(mimetype, attachment, "Media"); */

            /* try {
              const isRegisteredNumber = await checkRegisteredNumber(number);
            } catch (err) {
              res.status(422).json({
                status: false,
                message: "Nomor tidak teregister!",
              });
            } */

            // client.sendMessage('628567148813@c.us', number + '=' + message);
            client
              .sendMessage(number, media, { caption: caption })
              .then((response) => {
                res.status(200).json({
                  status: true,
                  message: response,
                });
                if (redirect != "" && redirect != null) {
                  return res.redirect(redirect);
                }
              })
              .catch((err) => {
                res.status(500).json({
                  status: false,
                  message: String(err),
                });
              });
          } else {
            res.status(422).json({
              status: status,
              message: message,
            });
          }
        })
        .catch((error) => {
          console.log("err = ", error);
          res.status(422).json({
            status: false,
            message: String(error),
          });
        });
    } catch (error) {
      console.log("err = ", error);
      res.status(422).json({
        status: false,
        message: String(error),
      });
    }
  });

  //send media url
  app.get("/send-media-url", async (req, res) => {
    try {
      const id = String(req.query.id);
      console.log(id);
      const number = phoneNumberFormatter(String(req.query.number));
      const caption = req.query.caption;
      const client = klien.find((sess) => sess.id == id).client;
      const fileurl = String(req.query.fileurl);
      const media = await MessageMedia.fromUrl(fileurl);
      const email = req.query.email;
      const token = req.query.token;

      console.log(
        process.env.serverwa +
          "/api/cektoken?email=" +
          email +
          "&token=" +
          token
      );

      axios
        .get(
          process.env.serverwa +
            "/api/cektoken?email=" +
            email +
            "&token=" +
            token
        )
        .then((response) => {
          let children = response.data;
          let status = children.status;
          let message = children.message;
          console.log("[Status = " + status + "] " + message);

          if (status == true) {
            // client.sendMessage('628567148813@c.us', number + '=' + message);
            client
              .sendMessage(number, media, { caption: caption })
              .then((response) => {
                res.status(200).json({
                  status: true,
                  message: response,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  status: false,
                  message: String(err),
                });
              });
          } else {
            res.status(422).json({
              status: status,
              message: message,
            });
          }
        })
        .catch((error) => {
          console.log("err = ", error);
          res.status(422).json({
            status: false,
            message: String(error),
          });
        });
    } catch (error) {
      console.log("err = ", error);
      res.status(422).json({
        status: false,
        message: String(error),
      });
    }
  });

  //send media file
  app.post(
    "/send-media-file",
    [body("number").notEmpty(), body("fileattach").notEmpty()],
    async (req, res) => {
      try {
        const redirect = String(req.body.redirect);
        const id = String(req.body.id);
        console.log(id);
        const number = phoneNumberFormatter(String(req.body.number));
        const caption = req.body.caption;
        const client = klien.find((sess) => sess.id == id).client;
        const fileattach = req.files.fileattach;
        const media = new MessageMedia(
          fileattach.mimetype,
          fileattach.data.toString("base64"),
          fileattach.name
        );
        // const media = await MessageMedia.fromFilePath(fileattach);
        const email = req.body.email;
        const token = req.body.token;

        console.log(
          process.env.serverwa +
            "/api/cektoken?email=" +
            email +
            "&token=" +
            token
        );

        axios
          .get(
            process.env.serverwa +
              "/api/cektoken?email=" +
              email +
              "&token=" +
              token
          )
          .then((response) => {
            let children = response.data;
            let status = children.status;
            let message = children.message;
            console.log("[Status = " + status + "] " + message);

            if (status == true) {
              // client.sendMessage('628567148813@c.us', number + '=' + message);
              client
                .sendMessage(number, media, { caption: caption })
                .then((response) => {
                  res.status(200).json({
                    status: true,
                    message: response,
                  });
                  /* if (redirect != "" && redirect != null) {
                    res.send(
                      '<script>window.location.href="' +
                        redirect +
                        '";alert("' +
                        String(err) +
                        '")</script>'
                    );
                  } */
                })
                .catch((err) => {
                  res.status(500).json({
                    status: false,
                    message: String(err),
                  });
                  /* if (redirect != "" && redirect != null) {
                    res.send(
                      '<script>window.location.href="' +
                        redirect +
                        '";alert("' +
                        String(err) +
                        '")</script>'
                    );
                  } */
                });
            } else {
              res.status(422).json({
                status: status,
                message: message,
              });
            }
          })
          .catch((error) => {
            console.log("err = ", error);
            res.status(422).json({
              status: false,
              message: String(error),
            });
          });
      } catch (error) {
        console.log("err = ", error);
        res.status(422).json({
          status: false,
          message: String(error),
        });
      }
    }
  );
}

module.exports = {
  routingnya,
};
