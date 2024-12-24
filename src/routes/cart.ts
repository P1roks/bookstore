import { Request, Router } from "express";
import { DatabaseHandler } from "../models/db/handler";
import { CartBookTransfer, SessionCart } from "../types";
import { db } from "..";
import { genSummary } from "../utils";
import { CartHandler } from "../models/cart-handler";
import { Types } from "mongoose";

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

cartRouter.post("/add", async (req: Request<{}, {}, CartBookTransfer>, res) => {
    // add item to cart
    const quantity = req.body.quantity ? parseInt(req.body.quantity, 10) : 1

    if(quantity > 0){
        const handler = new CartHandler(req.session.cart, (cart: SessionCart) => {req.session.cart = cart})
        await handler.addBook(req.body.bookId, quantity)
    }

    res.redirect("/")
})

cartRouter.post("/quantity", (req: Request<{}, {}, CartBookTransfer>, res) => {
    // change quantity of item
    const newQuantity = parseInt(req.body.quantity as string, 10)
    const bookId = parseInt(req.body.bookId as string, 10)
    if(!isNaN(newQuantity) && !isNaN(bookId) && newQuantity > 0){
        const handler = new CartHandler(req.session.cart, (cart: SessionCart) => {req.session.cart = cart})
        handler.changeQuantity(bookId, newQuantity)
    }

    res.redirect("/cart")
})

cartRouter.post("/delete", (req: Request<{}, {}, CartBookTransfer>, res) => {
    // delete given item
    const handler = new CartHandler(req.session.cart, (cart: SessionCart) => {req.session.cart = cart})
    handler.deleteBook(req.body.bookId)

    res.redirect("/cart")
})

cartRouter.get("/buy", async (req, res, next) => {
    // simulate buying - remove desired book quantity from DB and empty cart
    const handler = new CartHandler(req.session.cart, (cart: SessionCart) => {req.session.cart = cart})
    try{
        await handler.purchase()
    }catch(error){
        next(error)
    }

    res.render("infopage",
    {
        categories: DatabaseHandler.getCategoriesObject(),
        user: req.session.user,
        cart: req.session.cart,
        image: "/assets/after_purchase.png",
        header: "Zakupiono pomyślnie",
        description: "Życzymy miłego czytania!"
    })
})
