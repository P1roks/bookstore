import express from 'express';
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
app.use(express.static("public"))
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "/views"))

app.use("/", storeRouter)
app.use("/auth", authRouter)
app.use("/cart", cartRouter)

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
