const Camp = require("../models/camp");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mbxToken = process.env.MAPBOX_ACCESS_TOKEN;
const geoCoder = mbxGeocoding({ accessToken: mbxToken });
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
    const locationQuery = req.body.camp.location + ", New Zealand";  // Explicitly append New Zealand
    const geoData = await geoCoder
      .forwardGeocode({
        query: locationQuery,
        limit: 3, // Increase limit to get multiple results if necessary
      })
      .send();

    if (!geoData.body.features.length) {
      req.flash("error", "Location not found. Please try again.");
      return res.redirect("back");
    }

    // Handle multiple results: Choose the first or let the user confirm
    const bestMatch = geoData.body.features[0];
    
    // Optional: If you want to log and inspect multiple matches:
    if (geoData.body.features.length > 1) {
      req.flash("warning", "Multiple locations found, picking the first one.");
      console.log("Multiple matches found:", geoData.body.features);
    }

    // Optional: Validate coordinates to ensure they're within New Zealand's bounds
    const [longitude, latitude] = bestMatch.geometry.coordinates;
    if (latitude < -47.5 || latitude > -34.5 || longitude < 166.5 || longitude > 179) {
      req.flash("error", "Coordinates do not seem to match a valid location in New Zealand.");
      return res.redirect("back");
    }

    const camp = new Camp(req.body.camp);
    camp.geometry = bestMatch.geometry; // Use the best match coordinates
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
