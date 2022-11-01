// using official API code from Microsoft Azure
const https = require("https");

const express = require("express");
const app = express();

app.use("/public", express.static("public"));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.post("/stem", function (req, res) {
    var tokenizer = new natural.WordTokenizer(); 
    let tokens = tokenizer.tokenize(req.body["data"])
    let arr = [];
    for (s of tokens) {
        arr.push(natural.PorterStemmer.stem(s))
    }
    res.send(arr);
    // res.send([natural.PorterStemmer.stem(tokens)]);
});

const port = 3030;
app.listen(port, function () {
    console.log("Host at: http://localhost:" + port);
});