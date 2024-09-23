import { Router } from "express";
import { DatabaseHandler } from "../models/db/handler";
import { verifyUser } from "../middleware/authMiddleware";

export const userRouter = Router()

userRouter.use("/", verifyUser, (req, res) => res.render("error", {
    categories: DatabaseHandler.getCategoriesObject(),
    user: req.session.user,
    cart: req.session.cart,
    errorImage: "/assets/wip.png",
    errorCode: "Ta podstrona dalej powstaje",
    errorDescription: "Zajrzyj tutaj później"
}))
