const Camp = require("../models/camp");
const opencage = new OpencageGeocoder({ key: process.env.OPENCAGE_ACCESS_TOKEN })
  
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  const camps = await Camp.find({})
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  res.render("camps/index", { camps });
};

module.exports.newForm = (req, res) => {
  res.render("camps/new");
};

module.exports.createCamp = async (req, res, next) => {
  try {
    // Geocoding request to OpenCage API
    const locationQuery = req.body.camp.location + ", New Zealand";  // Append New Zealand to ensure accurate results

    const geoData = await opencage.geocode(locationQuery);

    if (!geoData || geoData.results.length === 0) {
      req.flash("error", "Location not found. Please try again.");
      return res.redirect("back");
    }

    const camp = new Camp(req.body.camp);
    // Assign coordinates from OpenCage geocode
    camp.geometry = {
      type: "Point",
      coordinates: [geoData.results[0].geometry.lng, geoData.results[0].geometry.lat],  // Extracting correct coordinates
    };

    camp.author = req.user._id;
    camp.images = req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    }));

    await camp.save();
    req.flash("success", "Successfully made a new camp!");
    res.redirect(`/camps/${camp._id}`);
  } catch (error) {
    req.flash("error", "Error in creating camp: " + error.message);
    return res.redirect("back");
  }
};

module.exports.showCamps = async (req, res) => {
  const camp = await Camp.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  
  if (!camp) {
    req.flash("error", "Camp not found");
    return res.redirect("/camps");
  }

  res.render("camps/show", { camp });
};


module.exports.editForm = async (req, res) => {
  const { id } = req.params;
  const camp = await Camp.findById(id);
  if (!camp) {
    req.flash("error", "Camp not found");
    return res.redirect("/camps");
  }
  res.render("camps/edit", { camp });
};

module.exports.updateCamp = async (req, res) => {
  const { id } = req.params;
  const camp = await Camp.findByIdAndUpdate(id, { ...req.body.camp });
  const imgs = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  camp.images.push(...imgs);
  if (!camp.author.equals(req.user._id)) {
    req.flash("error", "You must own this Camp");
    return res.redirect(`/camps/${id}`);
  }
  await camp.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await camp.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully Updated Camp!");
  res.redirect(`/camps/${camp._id}`);
};

module.exports.deleteCamp = async (req, res) => {
  const { id } = req.params;
  await Camp.findByIdAndDelete(id);
  req.flash("success", "Camp Deleted!");
  res.redirect("/camps");
};
