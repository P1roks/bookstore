import { Router } from "express";
import { db } from "..";
import { DatabaseHandler } from "../models/db/handler";
import { ConstraintFactory } from "../types";

export const storeRouter = Router()

storeRouter.get("/", async (req, res) => {
    // front page, display random books
    let books = await db.getRandomBooks(20);
    res.render("mainpage", { books, categories: DatabaseHandler.categories, user: undefined, cart: undefined})
})

storeRouter.get("/search", async (req, res) => {
    let parsedQuery = ConstraintFactory.getSQLConstraints(req.query as any)
    console.log(parsedQuery)
    let books = await db.getRandomBooks(20);
    res.render("search", {
        books,
        categories: DatabaseHandler.categories,
        user: undefined,
        cart: undefined,
        filters: {
            states: [],
            languages: [],
            minPrice: 100,
            maxPrice: undefined,
        },
    })
})

storeRouter.get("/book/:bookId", (req, res) => {
    // display info about given book
    let bookId = req.params.bookId
})
