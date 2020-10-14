const { User } = require("./models");

const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();

const SECRET = "cyqtokensecret";

app.use(express.json());

app.get("/api/findUsers", async (req, res) => {
  const data = await User.find();
  res.send(data);
});

const authMiddleware = async (req, res, next) => {
  const raw = String(req.headers.authorization).split(" ").pop();
  const { id } = jwt.verify(raw, SECRET);
  req.user = await User.findById(id);
  next();
};

app.get("/api/userinfo", authMiddleware, async (req, res) => {
  res.send(req.user);
});

app.post("/api/register", async (req, res) => {
  const user = await User.create({
    username: req.body.username,
    password: req.body.password,
  });
  res.send(user);
});

app.post("/api/login", async (req, res) => {
  const user = await User.findOne({
    username: req.body.username,
  });
  if (!user) {
    return res.status(422).send({
      message: "用户名不存在",
    });
  }
  const isPasswordValid = require("bcryptjs").compareSync(
    req.body.password,
    user.password
  );
  if (!isPasswordValid) {
    return res.status(422).send({
      message: "密码不正确",
    });
  }

  //   生成token;
  const token = jwt.sign(
    {
      id: String(user._id),
    },
    SECRET
  );
  res.send({ user, token });
});

app.listen(3005, () => {
  console.log("http://localhost:3005");
});
