const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash");

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});

router.get(`/:id`, async (req, res) => {
  User.findById(req.params.id)
    .select("-passwordHash")
    .then((user) => {
      if (!user) {
        return res.status(400).send("user not found");
      }
      return res.send(user);
    })
    .catch((error) => {
      return res.status(500).send({ success: false, error: error });
    });
});

router.post(`/register`, async (req, res) => {
  const emailExistence = await User.findOne({ email: req.body.email });
  if (emailExistence) {
    return res.status(400).send("email already exists");
  }
  // console.log(req.body);
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.passwordHash, 5),
    isAdmin: req.body.isAdmin,
    address: req.body.address,
  });

  user
    .save()
    .then((userData) => {
      res.send(userData);
    })
    .catch((error) => {
      res.status(500).send({ success: false, error: error });
    });
});

router.post(`/login`, (req, res) => {
  User.findOne({ email: req.body.email }).then((user) => {
    if (!user) {
      return res.status(400).send("user with this email not found");
    }
    if (
      user &&
      bcrypt.compareSync(req.body.passwordHash, user.passwordHash, {
        expiresIn: "1d",
      })
    ) {
      const token = jwt.sign(
        {
          userId: user.id,
          isAdmin: user.isAdmin,
        },
        process.env.TOKENSECRET
        // {expiresIn:'1d'},
      );
      res.status(200).send({ user: user.email, token: token });
    } else {
      res.status(400).send("inncorrect password");
    }
  });
});

router.delete(`/:id`, (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, messgae: "user deleted successfully " });
      } else {
        return res
          .status(400)
          .json({ success: false, messgae: "no such user" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

module.exports = router;
