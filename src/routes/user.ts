import { Router } from "express";
import { DatabaseHandler } from "../models/db/handler";
import { verifyUser } from "../middleware/authMiddleware";
import { CartHandler } from "../models/cart-handler";
import { ISessionCart } from "../types";

export const userRouter = Router()

userRouter.use(verifyUser)

userRouter.get("/", (req, res) => res.render("infopage", {
    categories: DatabaseHandler.getCategoriesObject(),
    user: req.session.user,
    cart: req.session.cart,
    image: "/assets/wip.png",
    header: "Ta podstrona dalej powstaje",
    description: "Zajrzyj tutaj później"
}))

userRouter.get("/logout", verifyUser, (req, res) => {
    req.session.user = undefined
    const handler = new CartHandler(req.session.cart, (cart: ISessionCart) => {req.session.cart = cart})
    handler.clear()
    res.redirect("/")
})
