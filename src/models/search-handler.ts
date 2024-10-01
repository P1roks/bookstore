import mysql from 'mysql2';
import { db } from ".."
import { BookDetail, BookProperty, CategoryInfoFull } from "../types"
import { DatabaseHandler } from './db/handler';

interface Filters{
    title: string
    state: BookProperty[],
    language: BookProperty[],
    selectedCategory: BookProperty[] | CategoryInfoFull,
    minPrice: number | null,
    maxPrice: number | null,
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

enum Operation{
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
    // provided via req.query
    private filters: SearchQueryParams

    constructor(filters: SearchQueryParams){
        this.filters = filters
    }

    private static createSearchParam = <T>({ tableName, columnName, operation }: SearchParamMetaData): (value: T) => SQLSearchParam<T> => (
        (value: T): SQLSearchParam<T> => ({
              lookupValue: value,
              tableName,
              columnName,
              operation,
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

    // convert each SQLSearchParam to corresponding SQL code
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
    
    // convert all defined params to SQL code and merge them with AND statements
    private getSQLConstraints(): string{
        return Object.entries(this.filters).map(([key, value]) => {
            try{
                return SearchHandler.toSQL(SearchHandler.searchParams[key](value))
            }
            catch{
                return null
            }
        }).filter(val => val !== null).join(" AND ")
    }

    // filter books according to provided params
    async getFilteredBooks(): Promise<BookDetail[]>{
        return await db.getBooksWithConstraint(this.getSQLConstraints()) as BookDetail[]
    }

    // generate sidebar filters state, so they can stay filled in between site reloads
    async getFiltersState(): Promise<Filters>{
        const filtersState: Filters = {
            title: "",
            state: DatabaseHandler.getStatesObject(),
            language: DatabaseHandler.getLanguagesObject(),
            selectedCategory: DatabaseHandler.getCategoriesObject(),
            minPrice: null,
            maxPrice: null,
        }

        for(const [key, value] of Object.entries(this.filters)){
            // if at least category is selected, get its info and try changing to selecterd subcategory, if it exists
            if(key === "category"){
                filtersState.selectedCategory = await db.getFullCategoryInfo(value)

                const subcategory = this.filters["subcategory"]
                if(subcategory){
                    const subIndex = filtersState.selectedCategory.subcategories.findIndex(sub => sub.id === subcategory)
                    if(subIndex !== -1){
                        filtersState.selectedCategory.subcategories[subIndex].checked = true;
                        // Always display selected subcategory as the first item
                        const temp = filtersState.selectedCategory.subcategories[0]
                        filtersState.selectedCategory.subcategories[0] = filtersState.selectedCategory.subcategories[subIndex]
                        filtersState.selectedCategory.subcategories[subIndex] = temp
                    }
                }
            }
            // if the value is multi-choice (i.e. array) then mark all present values as selected
            else if(Object.hasOwn(filtersState, key) && Array.isArray(value)){
                filtersState[key].filter((field: BookProperty) => value.includes(field.id)).map((f: BookProperty) => f.checked = true)
            }
            // if value exists, set corresponding filter to it
            else if(Object.hasOwn(filtersState, key)){
                filtersState[key] = value
            }
        }

        return filtersState
    }
}
