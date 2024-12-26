import { Request, Router } from "express";
import { DatabaseHandler } from "../models/db/handler";
import { ICartBookTransfer, ISessionCart } from "../types";
import { db } from "..";
import { genSummary } from "../utils";
import { CartHandler } from "../models/cart-handler";

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

cartRouter.post("/add", async (req: Request<{}, {}, ICartBookTransfer>, res) => {
    // add item to cart
    const quantity = req.body.quantity ? parseInt(req.body.quantity, 10) : 1

    if(quantity > 0){
        const handler = new CartHandler(req.session.cart, (cart: ISessionCart) => {req.session.cart = cart})
        await handler.addBook(req.body.bookId, quantity)
    }

    res.redirect("/")
})

cartRouter.post("/quantity", (req: Request<{}, {}, ICartBookTransfer>, res) => {
    // change quantity of item
    const newQuantity = parseInt(req.body.quantity as string, 10)
    if(!isNaN(newQuantity) && newQuantity > 0){
        const handler = new CartHandler(req.session.cart, (cart: ISessionCart) => {req.session.cart = cart})
        handler.changeQuantity(req.body.bookId, newQuantity)
    }

    res.redirect("/cart")
})

cartRouter.post("/delete", (req: Request<{}, {}, ICartBookTransfer>, res) => {
    // delete given item
    const handler = new CartHandler(req.session.cart, (cart: ISessionCart) => {req.session.cart = cart})
    handler.deleteBook(req.body.bookId)

    res.redirect("/cart")
})

cartRouter.get("/buy", async (req, res, next) => {
    // simulate buying - remove desired book quantity from DB and empty cart
    const handler = new CartHandler(req.session.cart, (cart: ISessionCart) => {req.session.cart = cart})
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
