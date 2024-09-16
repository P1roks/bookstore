import mysql from 'mysql2';
import { db } from ".."
import { Book, BookProperty, CategoryInfoFull } from "../types"
import { DatabaseHandler } from './db/handler';

export interface Filters{
    title: string
    state: BookProperty[],
    language: BookProperty[],
    selectedCategory: BookProperty[] | CategoryInfoFull,
    minPrice: number | undefined,
    maxPrice: number | undefined,
}

export interface SearchQueryParams{
    category?: number,
    subcategory?: number,
    state?: number[],
    language?: number[],
    title?: string,
    minPrice?: number,
    maxPrice?: number,
}

interface SearchParamMetaData{
    tableName: string,
    columnName: string,
    operation: Operation,
}

export enum Operation{
    Equal = "=",
    Greater = ">",
    GreaterEqual = ">=",
    Less = "<",
    LessEqual = "<=",
    Includes = "LIKE",
}

interface SQLSearchParam<T> extends SearchParamMetaData{
    lookupValue: T,
}

export class SearchHandler{
    private filters: SearchQueryParams

    private static createSearchParam = <T>({ tableName, columnName, operation }: SearchParamMetaData): (value: T) => SQLSearchParam<T> => (
        (value: T): SQLSearchParam<T> => ({
              lookupValue: value,
              tableName,
              columnName,
              // only include operation if it exists
              ...(operation && {operation}),
        })
    )

    private static searchParams: { [key in keyof Required<SearchQueryParams>]: (value: Required<SearchQueryParams>[key]) => SQLSearchParam<Required<SearchQueryParams>[key]> } = {
        category: SearchHandler.createSearchParam<number>({
            tableName: "categories",
            columnName: "id",
            operation: Operation.Equal,
        }),
        title: SearchHandler.createSearchParam<string>({
            tableName: "books",
            columnName: "title",
            operation: Operation.Includes,
        }),
        subcategory: SearchHandler.createSearchParam<number>({
            tableName: "subcategories",
            columnName: "id",
            operation: Operation.Equal,
        }),
        language: SearchHandler.createSearchParam<number[]>({
            tableName: "languages",
            columnName: "id",
            operation: Operation.Equal,
        }),
        state: SearchHandler.createSearchParam<number[]>({
            tableName: "books",
            columnName: "state",
            operation: Operation.Equal,
        }),
        minPrice: SearchHandler.createSearchParam<number>({
            tableName: "books",
            columnName: "price",
            operation: Operation.GreaterEqual,
        }),
        maxPrice: SearchHandler.createSearchParam<number>({
            tableName: "books",
            columnName: "price",
            operation: Operation.LessEqual,
        })
    }

    private static toSQL = (param: SQLSearchParam<any>): string => {
        if(!Array.isArray(param.lookupValue)){
            if(param.operation === Operation.Includes){
                param.lookupValue = `%${param.lookupValue}%`
            }
           return mysql.format(`??.?? ${param.operation} ?`, [param.tableName, param.columnName, param.lookupValue])
        }
        else{
           let placeholders = param.lookupValue.map(() => "?").join(", ") 
           return mysql.format(`??.?? IN (${placeholders})`, [param.tableName, param.columnName, ...param.lookupValue])
        }
    }
    
    private getSQLConstraints(): string{
        return Object.entries(this.filters).map(([key, value]) => {
            try{
                return SearchHandler.toSQL(
                    SearchHandler.searchParams[key](value)
                )
            }
            catch{
                return null
            }
        }).filter(val => val !== null).join(" AND ")
    }

    constructor(filters: SearchQueryParams){
        this.filters = filters
    }

    async getFilteredBooks(): Promise<Book[]>{
        return await db.getBooksWithConstraint(this.getSQLConstraints()) as Book[]
    }

    async getFilters(): Promise<Filters>{
        let filters: Filters = {
            title: "",
            state: DatabaseHandler.getStatesObject(),
            language: DatabaseHandler.getLanguagesObject(),
            selectedCategory: DatabaseHandler.getCategoriesObject(),
            minPrice: undefined,
            maxPrice: undefined,
        }

        for(const [key, value] of Object.entries(this.filters)){
            if(key === "maxPrice" || key === "minPrice"){
                filters[key] = value
            }
            else if(key === "category"){
                filters.selectedCategory = await db.getFullCategoryInfo(value)

                let subcategory = this.filters["subcategory"]
                if(subcategory){
                    let subIndex = filters.selectedCategory.subcategories.findIndex(sub => sub.id === subcategory)
                    if(subIndex !== -1){
                        filters.selectedCategory.subcategories[subIndex].checked = true;
                        // Always display selected subcategory as the first item
                        let temp = filters.selectedCategory.subcategories[0]
                        filters.selectedCategory.subcategories[0] = filters.selectedCategory.subcategories[subIndex]
                        filters.selectedCategory.subcategories[subIndex] = temp
                    }
                }
            }
            else if(filters[key]){
                if(Array.isArray(value)){
                    let found = filters[key].filter((field: any) => value.includes(field.id))
                    if(found) found.map((f: any) => f.checked = true)
                }
                else{
                    let found = filters[key].find((field: any) => field.id === value)
                    if(found) found.checked = true
                }
            }
        }

        return filters
    }
}
