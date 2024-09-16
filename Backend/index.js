const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel, BlogsModel } = require("./db");
const { auth, JWT_SECRET } = require("./auth");
const blogsApp = require("./blogs");
const path = require("path");
const cors = require("cors");

mongoose.connect(
  "mongodb+srv://Yash:Hello%401234@cluster0.so8pmoa.mongodb.net/blogs"
);
const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

//signup logic -> username, email, password
async function signUp(req, res) {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  try {
    const isExisting = await UserModel.findOne({ email });

    if (isExisting) {
      return res.status(400).json({
        msg: "You already signed up with this email!!",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      username,
      email,
      password: hashedPassword,
    });
    res.json({
      message: `Thanks!! You are signed up ${username}`,
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
}
//signin logic -> email, password
async function signIn(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
      return res.status(404).json("You are not signed up with this email");
    }

    const match = await bcrypt.compare(password, existingUser.password);

    if (match) {
      const token = jwt.sign({ id: existingUser._id.toString() }, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({
        token,
      });
    } else {
      res.status(403).json({
        message: "Incorrect credentials",
      });
    }
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
}

app.post("/signup", signUp);

app.post("/signin", signIn);

// Blog Routes
app.use("/blogs", blogsApp);

const Port = 3000;

app.listen(Port, () => {
  console.log(`Server is running on http://localhost:${Port}`);
});
