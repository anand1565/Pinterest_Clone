var express = require('express');
var router = express.Router();
const userModel = require('../models/user');
const postModel = require('../models/post');
const passport = require('passport');
const upload = require('./multer');
const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { nav: false });
});

router.get('/register', function (req, res, next) {
  res.render('register', { nav: false });
});

router.get('/profile', isLoggedIn, async (req, res) => {
  const user =
    await userModel
      .findOne({ username: req.session.passport.user })
      .populate("posts");
  console.log(user);
  res.render("profile", { user, nav: true });
})

router.get('/add', isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  res.render("add", { user, nav: true });
})

router.post('/createpost', isLoggedIn, upload.single("postImage"), async (req, res) => {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

router.get('/feed', isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const posts = await postModel.find().populate("user");
  res.render("feed", { user, posts, nav: true });
})

router.post('/fileupload', isLoggedIn, upload.single("image"), async (req, res) => {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect('/profile')
})

router.post('/register', async (req, res) => {
  const data = new userModel({
    email: req.body.email,
    name: req.body.name,
    username: req.body.username,
    contact: req.body.contact,
  })
  userModel.register(data, req.body.password)
    .then(() => {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/profile")
      })
    })
});

router.post('/login', passport.authenticate("local", {
  failureRedirect: "/",
  successRedirect: "/profile",
}), (req, res, next) => {

})

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/");
  }
}

module.exports = router;
