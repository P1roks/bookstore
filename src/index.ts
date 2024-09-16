import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import * as path from 'path';

import {storeRouter} from './routes/storeRoutes';
import {authRouter} from './routes/authRoutes';
import {cartRouter} from './routes/cartRoutes';
import { DatabaseHandler } from './models/db/handler';
import { SQLDatabase } from './models/db/database';

export let db: DatabaseHandler;
const app = express();
app.use(session({
    secret: "CHANGE_IN_PROD",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("src/public"))
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "/views"))

app.use("/", storeRouter)
app.use("/auth", authRouter)
app.use("/cart", cartRouter)

app.use((_req, res, _next) => {
    res.status(404).render("error",
        {categories: DatabaseHandler.getCategoriesObject(), user: undefined, cart: undefined, errorImage: "/assets/404.png", errorCode: 404, errorDescription: "Nie znaleziono podanej podstrony"})
})

app.use((error: Error, _req: Request, res: Response, next: NextFunction) => {
    if(res.headersSent){
        next(error)
    }

    console.log(`Error: ${error}`)
    res.status(500).render("error", {categories: [], user: undefined, cart: undefined, errorImage: "/assets/500.png", errorCode: 500, errorDescription: "Wewnętrzny błąd serwera"})
})

const runserver = async () => {
    let port = 8080;
    db = await DatabaseHandler.initialize(new SQLDatabase({
        host: "localhost",
        port: 3306,
        user: "fakeroot",
        password: "qwerty",
        database: "bookstore",
    }))


    app.listen(port, () => {
        console.log(`Serwer działa na adresie: http://localhost:${port}`)
    })
}
runserver()
