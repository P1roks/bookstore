import { Request, Router } from "express";
import { db } from "..";
import { DatabaseHandler } from "../models/db/handler";
import { parseQueryFilters } from "../middleware/searchMiddleware";
import { SearchHandler, SearchQueryParams } from "../models/search-handler";

export const storeRouter = Router()

storeRouter.get("/", async (req, res) => {
    // front page, display random books
    let books = await db.getRandomBooks(20);
    res.render("mainpage", { books, categories: DatabaseHandler.getCategoriesObject(), user: undefined, cart: undefined})
})

storeRouter.get("/search", parseQueryFilters, async (req: Request<{}, {}, {}, SearchQueryParams>, res) => {
    const handler = new SearchHandler(req.query);
    let books = await handler.getFilteredBooks()
    let filters = await handler.getFilters()
    res.render("search", {
        books,
        categories: DatabaseHandler.getCategoriesObject(),
        user: undefined,
        cart: undefined,
        filters,
    })
})

storeRouter.get("/book/:bookId", (req, res) => {
    // display info about given book
    let bookId = req.params.bookId
})
