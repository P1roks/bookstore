import { Response, Router } from "express";
import { DatabaseHandler } from "../models/db/handler";
import { AuthRequest, IUser, RegisterUserTransfer } from "../types";
import { db } from "..";
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

export const authRouter = Router();

const authPage = (req: AuthRequest, res: Response) => {
    res.render("auth", {
        categories: DatabaseHandler.getCategoriesObject(),
        user: req.session.user,
        cart: req.session.cart,
        loginError: req.loginError,
        registerError: req.registerError
    })
}

authRouter.get("/", authPage)

authRouter.post("/login", async (req: AuthRequest<IUser>, res, next) => {
    // try logging in
    const {email, password} = req.body
    const isValid = await db.checkUserCredentials({ email, password })
    if(isValid){
        try{
            req.session.user = await db.getUser(req.body.email)
            return res.redirect("/")
        }
        catch(error){
            return next(error)
        }
    }
    else{
        req.loginError = "Podano niepoprawny email/hasło"
        next()
    }
}, authPage)

authRouter.post("/register", async (req: AuthRequest<RegisterUserTransfer>, res, next) => {
    // try registering
    const { email, password, passwordRepeat } = req.body

    if(password.length === 0){
        req.registerError = "Podane hasło nie może być puste"
    }
    else if(password !== passwordRepeat){
        req.registerError = "Podane hasła nie są identyczne"
    }
    else if(!req.body.terms){
        req.registerError = "Nie zaakceptowano warunków korzystania"
    }
    else if(!emailRegex.test(email)){
        req.registerError = "Podany adres e-mail nie jest prawidłowy"
    }
    else{
        try{
            const userId = await db.addUser({email, password: password})
            req.session.user = await db.getUser(userId)
            return res.redirect("/")
        }
        catch(error){
            if(error.code && error.code === "ER_DUP_ENTRY"){
                req.registerError = "Użytkownik o podanym adresie e-mailu już istnieje"
            }
            else{
                return next(error)
            }
        }
    }

    next()
}, authPage)
