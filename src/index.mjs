import express from 'express';
import session from 'express-session';
import storeRouter from './routes/storeRoutes.mjs';
import authRouter from './routes/authRoutes.mjs';
import cartRouter from './routes/cartRoutes.mjs';

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

app.use("/", storeRouter)
app.use("/auth", authRouter)
app.use("/cart", cartRouter)

const runserver = () => {
    let port = 8080;

    app.listen(port, () => {
        console.log(`Serwer działa na adresie: http://localhost:${port}`)
    })
}
runserver()
