import { Response, Router } from "express";
import { DatabaseHandler } from "../models/db/handler";
import { AuthRequest, LoginUserTransfer, RegisterUserTransfer } from "../types";
import { db } from "..";
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const authRouter = Router();

const authPage = (req: AuthRequest, res: Response) => {
    res.render("auth", {
        categories: DatabaseHandler.getCategoriesObject(),
        user: req.session.user,
        cart: undefined,
        loginError: req.loginError,
        registerError: req.registerError
    })
}

authRouter.get("/", authPage)

authRouter.post("/login", async (req: AuthRequest<LoginUserTransfer>, res, next) => {
    // try logging in
    const {email, password} = req.body
    const isValid = await db.checkUserCredentials({ email, plainPassword: password })
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
            const userId = await db.addUser({email, plainPassword: password})
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

authRouter.post("/logout", (req, res) => {
    // logout
    res.redirect("/")
})
