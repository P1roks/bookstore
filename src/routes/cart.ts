import { Router } from "express";
import { DatabaseHandler } from "../models/db/handler";

export const cartRouter = Router()

cartRouter.get("/", (req, res) => {
    // get all items in the current cart
    res.render("cart", {categories: DatabaseHandler.getCategoriesObject()})
})

cartRouter.get("/add/:bookId", (req, res) => {
    // add item to cart
    let bookId = req.params.bookId
})

cartRouter.post("/quantity", (req, res) => {
    // change quantity of item
    let { bookId, newQuantity } = req.body
})

cartRouter.get("/delete/:bookId", (req, res) => {
    // delete given item
    let bookId = req.params.bookId
})

cartRouter.get("/buy", (req, res) => {
    // simulate buying - remove desired book quantity from DB and empty cart
})
