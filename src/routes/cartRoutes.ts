import { Router } from "express";

export const cartRouter = Router()

cartRouter.get("/", (req, res) => {
    // get all items in the current cart
    res.render("cart", {categories: []})
})

cartRouter.post("/add", (req, res) => {
    // add item to cart
})

cartRouter.post("/quantity", (req, res) => {
    // change quantity of item
})

cartRouter.post("/delete", (req, res) => {
    // delte given item
})

cartRouter.get("/buy", (req, res) => {
    //
})
