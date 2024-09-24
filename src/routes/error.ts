import { NextFunction, Request, Response, Router } from "express";
import { DatabaseHandler } from "../models/db/handler";

export const errorRouter = Router()

errorRouter.use((req, res) => res.status(404).render("error", {
    categories: DatabaseHandler.getCategoriesObject(),
    user: req.session.user,
    cart: req.session.cart,
    errorImage: "/assets/404.png",
    errorCode: 404,
    errorDescription: "Nie znaleziono podanej podstrony"
}))

errorRouter.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    if(res.headersSent){
        next(error)
    }

    console.log(`Error: ${error}`)
    res.status(500).render("error",
    {
        categories: [],
        user: req.session.user,
        cart: req.session.cart,
        errorImage: "/assets/500.png",
        errorCode: 500,
        errorDescription: "Wewnętrzny błąd serwera"
    })
})
