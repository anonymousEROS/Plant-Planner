const express = require('express')
const colors = require('colors')
const port = 3001
const {errorHandler} = require('./middleWare/errorMiddleWare')
const connectDB = require('./Config/db')

connectDB()
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended : false }))

app.use('/plants', require('./Routes/plantsRoutes'))

app.use(errorHandler)

app.listen(port, () => {console.log(`server on port ${port}`.bgMagenta.underline)})