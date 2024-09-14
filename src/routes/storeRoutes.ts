import { Router } from "express";
import { db } from "..";

export const storeRouter = Router()

storeRouter.get("/", (req, res) => {
    // front page, display random books
    let books = db.getRandomBooks(20);
    res.render("mainpage", { books })
})

storeRouter.get("/search", (req, res) => {
    // search books page
    let books = db.searchBooks(req.query);
    res.render("search", { books })
})

storeRouter.get("/book/:bookId", (req, res) => {
    // display info about given book
    let bookId = req.params.bookId
})
