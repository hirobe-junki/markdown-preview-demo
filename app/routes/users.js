const express = require("express");
const router = express.Router();
const db = require("../models/index");

/* GET users listing. */
router.get("/", (req, res, next) => {
  db.User.findAll().then((users) => {
    const data = {
      title: "Users/Index",
      content: users,
    };
    res.render("users/index", data);
  });
});

/* GET users/back listing. */
router.get("/back", (req, res, next) => {
  let back = req.session.back;
  if (!back) {
    back = "/users";
  }
  res.redirect(back);
});

/* GET users/add listing. */
router.get("/add", (req, res, next) => {
  const data = {
    title: "Users/Add",
    form: new db.User(),
    err: null,
  };
  res.render("users/add", data);
});

/* POST users/add listing. */
router.post("/add", (req, res, next) => {
  const form = {
    name: req.body.name,
    pass: req.body.pass,
    mail: req.body.mail,
    age: req.body.age,
  };
  db.sequelize.sync().then(() => {
    db.User.create(form)
      .then(() => {
        let back = req.session.back;
        if (!back) {
          back = "/users";
        }
        res.redirect(back);
      })
      .catch((err) => {
        const data = {
          title: "Users/Add",
          fom: form,
          err: err,
        };
        res.render("users/add", data);
      });
  });
});

/* GET users/edit listing. */
router.get("/edit", (req, res, next) => {
  db.User.findByPk(req.query.id).then((user) => {
    const data = {
      title: "User/Edit",
      form: user,
      err: null,
    };
    res.render("users/edit", data);
  });
});

/* POST users/edit listing. */
router.post("/edit", (req, res, next) => {
  const form = {
    name: req.body.name,
    pass: req.body.pass,
    mail: req.body.mail,
    age: req.body.age,
  };
  db.sequelize.sync().then(() => {
    db.User.update(form, {
      where: { id: req.body.id },
    })
      .then(() => {
        res.redirect("/users");
      })
      .catch((err) => {
        const data = {
          title: "Users/Edit",
          form: {
            id: req.body.id,
            name: req.body.name,
            pass: req.body.pass,
            mail: req.body.mail,
            age: req.body.age,
          },
          err: err,
        };
        res.render("users/edit", data);
      });
  });
});

/* POST users/delete listing. */
router.post("/delete", (req, res, next) => {
  db.sequelize.sync().then(() => {
    db.User.destroy({
      where: { id: req.body.id },
    }).then(() => {
      res.redirect("/users");
    });
  });
});

/* GET users/login listing. */
router.get("/login", (req, res, next) => {
  req.session.back = "/users/login";
  const data = {
    title: "Users/Login",
    content: "名前とパスワードを入力してください。",
  };
  res.render("users/login", data);
});

/* POST users/login listing. */
router.post("/login", (req, res, next) => {
  db.User.findOne({
    where: {
      name: req.body.name,
      pass: req.body.pass,
    },
  }).then((user) => {
    if (user) {
      req.session.login = user;
      res.redirect("/md");
    } else {
      const data = {
        title: "Users/Login",
        content: "名前かパスワードに問題があります。再度入力してください。",
      };
      res.render("users/login", data);
    }
  });
});

module.exports = router;
