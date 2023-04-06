const mongoose = require('mongoose')
const uri = "URI GOES HERE";
// require('events').EventEmitter.defaultMaxListeners = 15;
mongoose.set('strictQuery', false);

const connectDB = async () =>{
    try{
        const conn = await mongoose.connect(uri)

        console.log(`MongoDB connected: ${conn.connection.host}`.random.underline)
    } catch (error){
        console.log(error);
        process.exit(1)
    }
}

module.exports = connectDB