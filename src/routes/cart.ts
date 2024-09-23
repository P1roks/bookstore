import { Request, Router } from "express";
import { DatabaseHandler } from "../models/db/handler";
import { BookCartTransfer } from "../types";
import { db } from "..";
import { genSummary } from "../utils";

export const cartRouter = Router()

cartRouter.get("/", async (req, res, next) => {
    // get all items in the current cart
    try{
        const cartItems = await db.getCartItems(req.session.cart)
        const summary = genSummary(cartItems)
        return res.render("cart", {categories: DatabaseHandler.getCategoriesObject(), cart: req.session.cart, user: req.session.user, cartItems, summary})
    }
    catch(error){
        return next(error)
    }
})

cartRouter.post("/add", async (req: Request<{}, {}, BookCartTransfer>, res) => {
    // add item to cart
    const bookId = parseInt(req.body.bookId, 10)
    const quantity = req.body.quantity ? parseInt(req.body.quantity, 10) : 1
    if(!isNaN(bookId) && quantity > 0){
        const book = await db.getBookById(bookId)
        if(book){
            if(!req.session.cart){
                req.session.cart = {items: {}}
            }
            if(!req.session.cart.items[bookId]){
                (req.session.cart.items[bookId] as {}) = {}
            }
            const newQuantity = req.session.cart.items[bookId].quantity ? req.session.cart.items[bookId].quantity + quantity : quantity
            req.session.cart.items[bookId].quantity = newQuantity > book.quantity ? book.quantity : newQuantity
            req.session.cart.items[bookId].maxQuantity = book.quantity 
        }
    }
    res.redirect("/")
})

cartRouter.post("/quantity", (req: Request<{}, {}, BookCartTransfer>, res) => {
    // change quantity of item
    if(req.session.cart && req.body.quantity && req.body.bookId){
        const newQuantity = parseInt(req.body.quantity, 10)
        const bookId = parseInt(req.body.bookId, 10)
        if(!isNaN(newQuantity) && !isNaN(bookId) && newQuantity > 0){
            const maxQuantity = req.session.cart.items[bookId].maxQuantity
            req.session.cart.items[bookId].quantity = newQuantity > maxQuantity ? maxQuantity : newQuantity
        }
    }
    res.redirect("/cart")
})

cartRouter.post("/delete", (req: Request<{}, {}, BookCartTransfer>, res) => {
    // delete given item
    if(req.session.cart) delete req.session.cart.items[req.body.bookId]
    res.redirect("/cart")
})

cartRouter.get("/buy", async (req, res) => {
    // simulate buying - remove desired book quantity from DB and empty cart
    // req.session.cart = {items: {}}
    await db.updateBooksPostPurchase(req.session.cart)
    req.session.cart = {items: {}}
    res.redirect("/")
})
