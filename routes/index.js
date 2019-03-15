//=================================================Home Page======================================================
exports.index = function (req, res) {
  var userId = req.session.userId;
  if (userId == null) {
    res.redirect("/logout");
    return;
  }
  res.render('index.ejs');
};

//=================================================Login Page======================================================
exports.login = function (req, res) {
  if (req.method == "POST") {
    res.redirect('/');
  } else
    res.render('login.ejs');
};

exports.fourohfourG = function (req, res) {
  var userId = req.session.userId;
  if (userId == null) {
    res.redirect("/logout");
    return;
  }
  res.status(404).send("Time to 420");
};

exports.fourohfourP = function (req, res) {
  res.status(404).send("Time to 420");
}

exports.logout = function (req, res) {
  req.session.destroy();
  res.redirect("/login");
};