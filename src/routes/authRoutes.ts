import { Router } from "express";

export const authRouter = Router();

authRouter.get("/login", (req, res) => {
    // display login view
})

authRouter.post("/login", (req, res) => {
    // try logging in
})

authRouter.get("/register", (req, res) => {
    // display register view
})

authRouter.post("/register", (req, res) => {
    // try registering
})
