"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const storeRoutes_1 = require("./routes/storeRoutes");
const authRoutes_1 = require("./routes/authRoutes");
const cartRoutes_1 = require("./routes/cartRoutes");
const app = (0, express_1.default)();
app.use((0, express_session_1.default)({
    secret: "CHANGE_IN_PROD",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));
app.use("/", storeRoutes_1.storeRouter);
app.use("/auth", authRoutes_1.authRouter);
app.use("/cart", cartRoutes_1.cartRouter);
const runserver = () => {
    let port = 8080;
    app.listen(port, () => {
        console.log(`Serwer działa na adresie: http://localhost:${port}`);
    });
};
runserver();
