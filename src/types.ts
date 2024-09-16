import mysql from 'mysql2';
import { DatabaseHandler } from './models/db/handler';
import { db } from '.';

interface SearchParamOptions{
    tableName: string,
    columnName: string
    operation: Operation 
}

interface SearchParam<T> extends SearchParamOptions{
    lookupValue: T
}

export enum Operation{
    Equal = "=",
    Greater = ">",
    GreaterEqual = ">=",
    Less = "<",
    LessEqual = "<=",
    Includes = "LIKE",
}

export class SearchHandler{
    private filters: SearchQueryParams

    private static createSearchParam = <T>({ tableName, columnName, operation }: SearchParamOptions): (value: T) => SearchParam<T> => (
        (value: T): SearchParam<T> => ({
              lookupValue: value,
              tableName,
              columnName,
              // only include operation if it exists
              ...(operation && {operation}),
        })
    )

    private static searchParams: { [K in keyof Required<SearchQueryParams>]: (value: Required<SearchQueryParams>[K]) => SearchParam<Required<SearchQueryParams>[K]> } = {
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

    private static toSQL = (param: SearchParam<any>): string => {
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
            }
            else if(filters[key]){
                if(Array.isArray(value)){
                    let found = filters[key].filter((field: any) => !value.includes(field.id))
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

export interface DatabaseConstructorData {
    host: string | undefined, 
    port: number | undefined, 
    user: string | undefined, 
    password: string | undefined, 
    database: string
}

export interface Database{
    query(query: string): Promise<unknown[]>
}

export interface BookProperty{
    id: number,
    name: string,
    checked?: boolean,
}

export interface BookState{
    name: string,
    checked: boolean,
}

export interface CategoryWithSubcategories extends BookProperty{
    subcategories: string[]
}

export interface CategoryInfoFull{
    id: number,
    name: string,
    subcategories: BookProperty[],
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

export interface Book{
    id: number,
    title: string,
    author: string,
    description: string,
    category: string,
    subcategory: string,
    language: string,
    price: number,
    quantity: number,
    tome: number | null,
}

export interface Filters{
    title: string
    state: BookProperty[],
    language: BookProperty[],
    selectedCategory: BookProperty[] | CategoryInfoFull,
    minPrice: number | undefined,
    maxPrice: number | undefined,
}
