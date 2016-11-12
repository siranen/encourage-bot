const express     = require("express");
const app         = express();

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("encouragesplash");
});

app.listen(3000, () => {
  console.log("Example app listening on port ");
});
