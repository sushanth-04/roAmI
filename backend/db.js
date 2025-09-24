const mongoose=require('mongoose');

const MONGO_URI="mongodb+srv://majorprojectvbit:D0lJdNALdbqbAhGE@roamai.ildch.mongodb.net/?retryWrites=true&w=majority&appName=roamai"


const connectToMongo = () => {
    mongoose.connect(MONGO_URI)
        .then(() => console.log("MongoDB Connected...."))
        .catch((e) => {
            console.error("MongoDB connection error:", e);
        });
};


module.exports=connectToMongo