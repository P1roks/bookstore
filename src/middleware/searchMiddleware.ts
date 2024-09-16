import { NextFunction, Request, Response } from "express";
import { SearchQueryParams } from "../models/search-handler";

export const parseQueryFilters = (req: Request, _res: Response, next: NextFunction) => {
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

    const validKeys: { [key in keyof SearchQueryParams]: (value: any) => any | undefined } = {
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
}
