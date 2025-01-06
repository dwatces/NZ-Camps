const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Camp = require("../models/camp");

mongoose.connect("mongodb://localhost:27017/nz-camps", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("mongodb connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Camp.deleteMany({});
  for (let i = 0; i < 101; i++) {
    const random101 = Math.floor(Math.random() * 101);
    const price = Math.floor(Math.random() * 50) + 10;
    const camp = new Camp({
      author: "60f7793209882d04541201e2",
      location: `${cities[random101].city}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://res.cloudinary.com/dghtrpkzv/image/upload/v1626998320/NZCamps/kehjmujmqwwu9dll3pm5.jpg",
          filename: "NZCamps/kehjmujmqwwu9dll3pm5",
        },
        {
          url: "https://res.cloudinary.com/dghtrpkzv/image/upload/v1626998322/NZCamps/ilwhagvxee7oclevtkxe.jpg",
          filename: "NZCamps/ilwhagvxee7oclevtkxe",
        },
        {
          url: "https://res.cloudinary.com/dghtrpkzv/image/upload/v1626998328/NZCamps/spt6ogx4boxph9e3gwoj.jpg",
          filename: "NZCamps/spt6ogx4boxph9e3gwoj",
        },
        {
          url: "https://res.cloudinary.com/dghtrpkzv/image/upload/v1626998330/NZCamps/vltxlpeaqxexxmzsxvzg.jpg",
          filename: "NZCamps/vltxlpeaqxexxmzsxvzg",
        },
        {
          url: "https://res.cloudinary.com/dghtrpkzv/image/upload/v1626998331/NZCamps/s8fnpeccxpbt5r6jkjbu.jpg",
          filename: "NZCamps/s8fnpeccxpbt5r6jkjbu",
        },
      ],
      description:
        "Lorem ipsum dolor, amet consectetur adipisicing elit. Nostrum ipsa beatae temporibus quasi eaque dignissimos corrupti possimus nobis, velit nulla expedita numquam quod quia suscipit quidem molestias, commodi at ipsum.",
      price,
      geometry: {
        type: "Point",
        coordinates: [cities[randnom101].lng, cities[random101].lat],
      },
    });
    await camp.save();
  }
};

seedDB().then(() => {
  db.close();
});
