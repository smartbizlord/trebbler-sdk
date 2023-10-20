const express = require('express')
const app = express()
require('dotenv').config()
const trebbler = require('../index')


app.use(trebbler(
    process.env.API_KEY,
    process.env.PROJECT_ID,
))

app.all("/example", (req, res) => {
    res.send({message: "it works"})
    // res.send("it works")
})

app.listen(3008, () => {
    console.log("works fine")
})