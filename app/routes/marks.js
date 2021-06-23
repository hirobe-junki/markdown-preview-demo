const express = require("express");
const router = express.Router();
const db = require("../models/index");
const { Op } = require("sequelize");
const MarkdownIt = require("markdown-it");
const markdown = new MarkdownIt();

const pnum = 10;

// ログインのチェック
const check = (req, res) => {
  if (!req.session.login) {
    req.session.back = "/md";
    res.redirect("/users/login");
    return false;
  } else {
    return true;
  }
};

// 日付フォーマット
const formatDate = (targetDate) => {
  const d = new Date(targetDate);
  const year = ("0000" + d.getFullYear()).slice(-4);
  const month = ("00" + (d.getMonth() + 1)).slice(-2);
  const date = ("00" + d.getDate()).slice(-2);
  const hours = ("00" + d.getHours()).slice(-2);
  const minutes = ("00" + d.getMinutes()).slice(-2);
  const seconds = ("00" + d.getSeconds()).slice(-2);
  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
};

// 指定IDのMarkdataの表示ページ作成
const makepage = (res, id, md, flg) => {
  let footer;
  if (flg) {
    const createdAt = formatDate(md.createdAt);
    const updatedAt = formatDate(md.updatedAt);
    footer = `(created: ${createdAt}, updated: ${updatedAt})`;
  } else {
    footer = "(Updating date and time information...)";
  }
  const data = {
    title: "Mardown",
    id: id,
    head: md.title,
    footer: footer,
    content: markdown.render(md.content),
    source: md.content,
  };
  res.render("md/mark", data);
};

/* GET md listing. */
router.get("/", (req, res, next) => {
  if (!check(req, res)) {
    return;
  }
  db.Markdata.findAll({
    where: {
      userId: req.session.login.id,
    },
    limit: pnum,
    order: [["updatedAt", "DESC"]],
  }).then((markdowns) => {
    const data = {
      title: "Markdown/Search",
      login: req.session.login,
      message: "※最近の投稿データ",
      form: { find: "" },
      content: markdowns,
    };
    res.render("md/index", data);
  });
});

/* POST md/find listing. */
router.post("/", (req, res, next) => {
  if (!check(req, res)) {
    return;
  }
  db.Markdata.findAll({
    where: {
      userId: req.session.login.id,
      content: { [Op.like]: `%${req.body.find}%` },
    },
    order: [["updatedAt", "DESC"]],
  }).then((markdowns) => {
    const data = {
      title: "Markdown/Search",
      login: req.session.login,
      message: `※"${req.body.find}"で検索された最近のデータ`,
      form: req.body,
      content: markdowns,
    };
    res.render("md/index", data);
  });
});

/* GET md/add listing. */
router.get("/add", (req, res, next) => {
  if (!check(req, res)) {
    return;
  }
  res.render("md/add", { title: "Markdown/Add" });
});

/* POST md/add listing. */
router.post("/add", (req, res, next) => {
  if (!check(req, res)) {
    return;
  }
  db.sequelize.sync().then(() => {
    db.Markdata.create({
      userId: req.session.login.id,
      title: req.body.title,
      content: req.body.content,
    }).then((model) => {
      res.redirect("/md");
    });
  });
});

/* GET md/mark listing. */
router.get("/mark", (req, res, next) => {
  if (!check(req, res)) {
    return;
  }
  const id = req.query.id;
  if (!id) {
    res.redirect("/md");
  }
  db.Markdata.findOne({
    where: {
      id: id,
      userId: req.session.login.id,
    },
  }).then((md) => {
    makepage(res, id, md, true);
  });
});

/* GET md/mark listing. */
router.post("/mark", (req, res, next) => {
  if (!check(req, res)) {
    return;
  }
  const id = req.body.id;
  const source = req.body.source;
  db.Markdata.findByPk(id).then((md) => {
    md.content = source;
    md.save().then((updatedMd) => {
      makepage(res, id, updatedMd, false);
    });
  });
});

module.exports = router;
