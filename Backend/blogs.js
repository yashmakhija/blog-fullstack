const express = require("express");
const { BlogsModel } = require("./db");
const { auth, JWT_SECRET } = require("./auth");

const app = express();

// Create a Blog
app.post("/", auth, async (req, res) => {
  try {
    const title = req.body.title;
    const content = req.body.content;
    const author = req.user.id;

    const newBlog = new BlogsModel({ title, content, author });
    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});

// Show All Blogs
app.get("/", async (req, res) => {
  try {
    const blogs = await BlogsModel.find()
      .populate("author", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(blogs);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});

// Edit a Specific Blog by ID
app.put("/:id", auth, async (req, res) => {
  const id = req.params.id;
  const { title, content } = req.body;

  try {
    const updatedBlog = await BlogsModel.findByIdAndUpdate(
      id,
      { title, content, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(updatedBlog);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

app.delete("/:id", auth, async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  try {
    const blog = await BlogsModel.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this blog" });
    }

    await BlogsModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});

app.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await BlogsModel.findById(id).populate("author", "username");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(blog);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});

app.get("/search", async (req, res) => {
  const { query } = req.query; // e.g., ?query=searchTerm

  try {
    const blogs = await BlogsModel.find({
      $or: [
        { title: new RegExp(query, "i") },
        { content: new RegExp(query, "i") },
      ],
    })
      .populate("author", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(blogs);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});

module.exports = app;
