const Camp = require("../models/camp");
const opencage = require('opencage-api-client');
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  try {
    const camps = await Camp.find({})
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("author");
    res.render("camps/index", { camps });
  } catch (error) {
    req.flash("error", "Error fetching camps: " + error.message);
    res.redirect("back");
  }
};

module.exports.newForm = (req, res) => {
  res.render("camps/new");
};

module.exports.createCamp = async (req, res, next) => {
  try {
    // Geocoding request to OpenCage API
    const locationQuery = req.body.camp.location + ", New Zealand";  // Append New Zealand to ensure accurate results

    const geoData = await opencage.geocode({ q: locationQuery, key: process.env.OPENCAGE_ACCESS_TOKEN });

    if (!geoData || geoData.status.code !== 200 || geoData.results.length === 0) {
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
  try {
    const camp = await Camp.findById(req.params.id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("author");

    if (!camp) {
      req.flash("error", "Camp not found");
      return res.redirect("/camps");
    }

    res.render("camps/show", { camp });
  } catch (error) {
    req.flash("error", "Error fetching camp details: " + error.message);
    res.redirect("/camps");
  }
};

module.exports.editForm = async (req, res) => {
  try {
    const { id } = req.params;
    const camp = await Camp.findById(id);
    if (!camp) {
      req.flash("error", "Camp not found");
      return res.redirect("/camps");
    }
    res.render("camps/edit", { camp });
  } catch (error) {
    req.flash("error", "Error fetching camp for editing: " + error.message);
    return res.redirect("/camps");
  }
};

module.exports.updateCamp = async (req, res) => {
  try {
    const { id } = req.params;
    const camp = await Camp.findById(id);

    if (!camp) {
      req.flash("error", "Camp not found");
      return res.redirect("/camps");
    }

    // Ensure the camp is owned by the logged-in user
    if (!camp.author.equals(req.user._id)) {
      req.flash("error", "You must own this Camp to update it");
      return res.redirect(`/camps/${id}`);
    }

    // Update the camp
    Object.assign(camp, req.body.camp);

    // Add new images if any
    const imgs = req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    }));
    camp.images.push(...imgs);

    await camp.save();

    // Handle deleting images if requested
    if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
        await cloudinary.uploader.destroy(filename); // Delete image from Cloudinary
      }
      await camp.updateOne({
        $pull: { images: { filename: { $in: req.body.deleteImages } } },
      });
    }

    req.flash("success", "Successfully Updated Camp!");
    res.redirect(`/camps/${camp._id}`);
  } catch (error) {
    req.flash("error", "Error in updating camp: " + error.message);
    res.redirect("back");
  }
};

module.exports.deleteCamp = async (req, res) => {
  try {
    const { id } = req.params;
    const camp = await Camp.findById(id);

    if (!camp) {
      req.flash("error", "Camp not found");
      return res.redirect("/camps");
    }

    // Delete associated images from Cloudinary
    for (let image of camp.images) {
      await cloudinary.uploader.destroy(image.filename);
    }

    await Camp.findByIdAndDelete(id);
    req.flash("success", "Camp Deleted!");
    res.redirect("/camps");
  } catch (error) {
    req.flash("error", "Error in deleting camp: " + error.message);
    res.redirect("/camps");
  }
};
