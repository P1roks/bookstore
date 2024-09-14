"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.get("/login", (req, res) => {
    // display login view
});
exports.authRouter.post("/login", (req, res) => {
    // try logging in
});
exports.authRouter.get("/register", (req, res) => {
    // display register view
});
exports.authRouter.post("/register", (req, res) => {
    // try registering
});
