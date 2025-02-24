const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;
const POSTS_FILE = path.join(__dirname, "posts.json");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); 
app.set("view engine", "ejs");


app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});


app.get("/", (req, res) => {
    res.redirect("/posts");
});


app.get("/posts", (req, res) => {
    fs.readFile(POSTS_FILE, "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading posts.");
        const posts = JSON.parse(data || "[]");
        res.render("home", { posts });
    });
});


app.get("/post", (req, res) => {
    const postId = req.query.id;
    fs.readFile(POSTS_FILE, "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading posts.");
        const posts = JSON.parse(data || "[]");
        const post = posts.find((p) => p.id == postId);
        if (!post) return res.status(404).send("Post not found.");
        res.render("post", { post });
    });
});

app.post("/add-post", (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) return res.redirect("/posts");

    fs.readFile(POSTS_FILE, "utf8", (err, data) => {
        let posts = [];
        if (!err && data) posts = JSON.parse(data);
        const newPost = { id: posts.length + 1, title, content };
        posts.push(newPost);
        fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), (err) => {
            if (err) return res.status(500).send("Error saving post.");
            res.redirect("/posts");
        });
    });
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
