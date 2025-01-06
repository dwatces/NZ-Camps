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
    // Check if geoCoder is a function
    console.log("GeoCoder function:", geoCoder.forwardGeocode);
    
    const locationQuery = req.body.camp.location + ", New Zealand";  // Explicitly append New Zealand
    const geoData = await geoCoder
      .forwardGeocode({
        query: locationQuery,
        limit: 1, // Limit to 1 result to avoid ambiguity
      })
      .send();

    // Check if any geocoding result was returned
    if (!geoData.body.features.length) {
      req.flash("error", "Location not found. Please try again.");
      return res.redirect("back");
    }

    // Optional: Log multiple geocoding results if they exist
    if (geoData.body.features.length > 1) {
      req.flash("warning", "Multiple locations found, picking the first one.");
      console.log("Multiple matches found:", geoData.body.features);
    }

    const bestMatch = geoData.body.features[0];

    // Optional: Validate coordinates to ensure they're within New Zealand's bounds
    const [longitude, latitude] = bestMatch.geometry.coordinates;
    if (latitude < -47.5 || latitude > -34.5 || longitude < 166.5 || longitude > 179) {
      req.flash("error", "Coordinates do not seem to match a valid location in New Zealand.");
      return res.redirect("back");
    }

    // Create the camp object
    const camp = new Camp(req.body.camp);
    camp.geometry = bestMatch.geometry; // Set the coordinates from the best match
    camp.author = req.user._id;
    camp.images = req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    }));

    // Save the new camp to the database
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
