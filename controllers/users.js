const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    const link = process.env.BASE_URL + "/camps/new";
    const message =
      `Welcome to NZ Camps, ${username}! add a camp you've visited before, by clicking here: <a href="` +
      link +
      `"></a>, or leave a review on an existing camp below.`;
    req.login(user, (err) => {
      if (err) return next(err);
      req.flash("success", message);
      res.redirect("/camps");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome Back!");
  const redirectUrl = req.session.returnTo || "/camps";
  delete req.session.returnTos;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "Logged out!");
  res.redirect("/camps");
};
