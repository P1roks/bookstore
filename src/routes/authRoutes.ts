import { Router } from "express";

export const authRouter = Router();

authRouter.get("/", (req, res) => {
    res.render("auth", {categories: [], user: undefined, cart: undefined})
})

authRouter.post("/login", (req, res) => {
    // try logging in

})

authRouter.post("/register", (req, res) => {
    // try registering
})
