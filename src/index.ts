import dotenv from 'dotenv';
dotenv.config();

import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import * as path from 'path';

import { storeRouter } from './routes/store';
import { authRouter } from './routes/auth';
import { cartRouter } from './routes/cart';
import { DatabaseHandler } from './models/db/handler';
import { SQLDatabase } from './models/db/database';
import rateLimit from 'express-rate-limit';
import { userRouter } from './routes/user';

export let db: DatabaseHandler;
const app = express();

app.use(session({
    secret: "CHANGE_IN_PROD",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}))

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
}))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))
app.set("view engine", "ejs")
app.set("views", path.join(process.cwd(), "/views"))

app.use("/", storeRouter)
app.use("/auth", authRouter)
app.use("/cart", cartRouter)
app.use("/account", userRouter)

app.use((req, res) => res.status(404).render("infopage", {
    categories: DatabaseHandler.getCategoriesObject(),
    user: req.session.user,
    cart: req.session.cart,
    image: "/assets/404.png",
    header: "404",
    description: "Nie znaleziono podanej podstrony"
}))

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    if(res.headersSent){
        next(error)
    }

    console.log(`Error: ${error}`)

    res.status(500).render("infopage",
    {
        categories: DatabaseHandler.getCategoriesObject(),
        user: req.session.user,
        cart: req.session.cart,
        image: "/assets/500.png",
        header: "500",
        description: "Wewnętrzny błąd serwera"
    })
})

const runserver = async () => {
    let port = 8080;
    // use attributes defined in .env file
    db = await DatabaseHandler.setup(new SQLDatabase({
        host: process.env.SQL_HOST ? process.env.SQL_HOST : "localhost",
        port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : 3306,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE,
    }))


    app.listen(port, () => {
        console.log(`Serwer działa na adresie: http://localhost:${port}`)
    })
}
runserver()
