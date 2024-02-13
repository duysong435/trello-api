const express = require('express')
const app = express()

const hostname = 'localhost'
const port = 8080

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.listen(port, hostname, () => {
  console.log('App running %s %d', port)
})