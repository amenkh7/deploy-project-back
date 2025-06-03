const { default: mongoose } = require('mongoose')
const moongose=require('mongoose')
const connectDB=async()=>{
try {
    await mongoose.connect(process.env.MONGO_URI,{
        useUnifiedTopology: true,
        useNewUrlParser:true
    })
    console.log('Connected to myDB')
}
catch (err) {
    console.error('Connection to myDB failed', err.stack)
    process.exit(1)
} }

module.exports=connectDB