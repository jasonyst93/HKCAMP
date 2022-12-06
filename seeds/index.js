const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground') //we are in seeds so need to ../ to access models 

mongoose.connect('mongodb://localhost:27017/yelp-camp'), {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}

const db = mongoose.connection; //easy to access as 'db'
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const sample = (array) => array[Math.floor(Math.random() * array.length)]; //random index in array

const seedDB = async () => {
    await Campground.deleteMany({}); //delete all data first
    for (let i = 0; i < 1; i++) {
        const random1000 = Math.floor(Math.random() * 1000); //random city and save it
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({        //save to Campground model
            //UR USER ID
            author: '634a6b5812c20a6f970ec00e',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quibusdam porro facilis, aut quis molestias veniam, placeat possimus illo cumque dignissimos ipsum magni commodi quaerat! Ipsum fugiat deleniti incidunt? Aut, est.",
            price: price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dvkzyfskf/image/upload/v1665922329/YelpCamp/i4o0mnu4zw3ojcwqiktf.webp',
                    filename: 'YelpCamp/i4o0mnu4zw3ojcwqiktf',
                },
                {
                    url: 'https://res.cloudinary.com/dvkzyfskf/image/upload/v1665922329/YelpCamp/vw1kj6bidulfpuravhur.webp',
                    filename: 'YelpCamp/vw1kj6bidulfpuravhur',
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
}); // run the code gen the data and then close the connection