// using official API code from Microsoft Azure
const https = require("https");

const express = require("express");
const app = express();

app.use("/public", express.static("public"));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.post("/*", function (req, res) {
    // fetch results from Bing
    return https.get({
        hostname: "api.bing.microsoft.com",
        path: "/v7.0/search?q=" + req.url.slice(1),
        headers: { "Ocp-Apim-Subscription-Key": "68dc5cf46ecc419688a1066dd7b2b9d5" },
    });
});

const port = 3030;
app.listen(port, function () {
    console.log("Host at: http://localhost:" + port);
});