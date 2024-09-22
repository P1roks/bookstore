import { Request, Router } from "express";
import { DatabaseHandler } from "../models/db/handler";
import { BookCartTransfer } from "../types";
import { db } from "..";
import { genSummary } from "../utils";

export const cartRouter = Router()

cartRouter.get("/", async (req, res) => {
    // get all items in the current cart
    const cartItems = await db.getCartItems(req.session.cart)
    const summary = genSummary(cartItems)

    res.render("cart", {categories: DatabaseHandler.getCategoriesObject(), cart: req.session.cart, user: req.session.user, cartItems, summary})
})

cartRouter.post("/add", async (req: Request<{}, {}, BookCartTransfer>, res) => {
    // add item to cart
    const bookId = parseInt(req.body.bookId, 10)
    const quantity = req.body.quantity ? parseInt(req.body.quantity, 10) : 1
    if(!isNaN(bookId)){
        const book = await db.getBookById(bookId)
        if(book){
            if(!req.session.cart){
                req.session.cart = {items: {}}
            }
            req.session.cart.items[bookId] = quantity
        }
    }
    res.redirect("/")
})

cartRouter.post("/quantity", (req: Request<{}, {}, BookCartTransfer>, res) => {
    // change quantity of item
    if(req.session.cart && req.body.bookId in req.session.cart.items && req.body.quantity) req.session.cart.items[req.body.bookId] = req.body.quantity
    res.redirect("/cart")
})

cartRouter.post("/delete", (req: Request<{}, {}, BookCartTransfer>, res) => {
    // delete given item
    if(req.session.cart) delete req.session.cart.items[req.body.bookId]
    res.redirect("/cart")
})

cartRouter.get("/buy", (req, res) => {
    // simulate buying - remove desired book quantity from DB and empty cart
})
