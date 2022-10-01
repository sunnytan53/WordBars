const express = require('express');
const app = express();

// app.use('/public', express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/index.html")
})

const port = 3030;
app.listen(port, function() {
    console.log("Host at: (crtl/command + click to open)")
    console.log("http://localhost:" + port)
})