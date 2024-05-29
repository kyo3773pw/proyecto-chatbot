import mongoose from "mongoose";

export const connectDB = async () =>{
    try{
        await mongoose.connect('mongodb+srv://paul:riukido.258@cluster3.kjpsw2t.mongodb.net/cluster3');
        console.log(">>> DB is connected")
    } catch (error) {
        console.log(error);
    }
};