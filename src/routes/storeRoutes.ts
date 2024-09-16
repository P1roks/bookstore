import { Request, Router } from "express";
import { db } from "..";
import { DatabaseHandler } from "../models/db/handler";
import { BookProperty, SearchHandler, CategoryInfoFull, SearchQueryParams } from "../types";

export const storeRouter = Router()

storeRouter.get("/", async (req, res) => {
    // front page, display random books
    let books = await db.getRandomBooks(20);
    console.log(DatabaseHandler.getCategoriesObject())
    res.render("mainpage", { books, categories: DatabaseHandler.getCategoriesObject(), user: undefined, cart: undefined})
})

storeRouter.get("/search", (req, res, next) => {
    const result: SearchQueryParams = {};

    const convertToNumber = (value: any): number | undefined => {
        let res = parseInt(value, 10)
        if(isNaN(res)) return undefined
        return res
    }

    const convertToNumberArray = (value: any[]): number[] | undefined => {
        for(let i = 0; i < value.length; ++i){
            let res = parseInt(value[i])
            if(isNaN(res)) return undefined
            value[i] = res
        }
        return value
    }

    const validKeys: { [key in keyof SearchQueryParams]?: (value: any) => any | undefined } = {
        category: (value: any) => convertToNumber(value),
        subcategory: (value: any) => convertToNumber(value),
        state: (value: any) => Array.isArray(value) ? convertToNumberArray(value) : convertToNumber(value),
        language: (value: any) => Array.isArray(value) ? convertToNumberArray(value) : convertToNumber(value),
        title: (value: any) => value,
        minPrice: (value: any) => convertToNumber(value),
        maxPrice: (value: any) => convertToNumber(value),
    };

    for (const [key, val] of Object.entries(req.query)) {
        if (key in validKeys) {
            let converted = validKeys[key](val)
            if(converted){
                result[key] = converted
            }
        }
    }

    req.query = result as any;
    next()
},
async (req: Request<{}, {}, {}, SearchQueryParams>, res) => {
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
