const express = require("express");
const router = express.Router();


//POSTS 
//Index-Route
router.get("/", (req, res) => {
    res.send("GET for posts");
})

//Show-Route
router.get("/:id", (req, res) => {
    res.send("GET for posts id");
})

//POST 
router.post("/", (req, res) => {
    res.send("POST for posts");
})

//DELETE
router.delete("/:id", (req, res) => {
    res.send("DELETE for posts id");
})

module.exports = router;