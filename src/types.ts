import mysql from 'mysql2';

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

export enum State{
    New = 0,
    VeryGood = 1,
    Good = 2,
    Destroyed = 3,
}

export class ConstraintFactory{
    private static createSearchParam = <T>({ tableName, columnName, operation }: SearchParamOptions): (value: T) => SearchParam<T> => (
        (value: T): SearchParam<T> => ({
              lookupValue: value,
              tableName,
              columnName,
              // only include operation if it exists
              ...(operation && {operation}),
        })
    )

    private static searchParams: { [key: string]: (value: any) => SearchParam<any> } = {
        category: ConstraintFactory.createSearchParam<number>({
            tableName: "categories",
            columnName: "id",
            operation: Operation.Equal,
        }),
        title: ConstraintFactory.createSearchParam<string>({
            tableName: "books",
            columnName: "title",
            operation: Operation.Includes,
        }),
        subcategory: ConstraintFactory.createSearchParam<number>({
            tableName: "subcategories",
            columnName: "id",
            operation: Operation.Equal,
        }),
        language: ConstraintFactory.createSearchParam<number[]>({
            tableName: "languages",
            columnName: "id",
            operation: Operation.Equal,
        }),
        states: ConstraintFactory.createSearchParam<State[]>({
            tableName: "books",
            columnName: "state",
            operation: Operation.Equal,
        }),
        minPrice: ConstraintFactory.createSearchParam<number>({
            tableName: "books",
            columnName: "price",
            operation: Operation.GreaterEqual,
        }),
        maxPrice: ConstraintFactory.createSearchParam<number>({
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
    
    public static getSQLConstraints = (constraints: {value: any}[]): string =>
        Object.entries(constraints).map(([key, value]) => {
            try{
                return ConstraintFactory.toSQL(
                    ConstraintFactory.searchParams[key](value)
                )
            }
            catch{
                return null
            }
        }).filter(val => val !== null).join(" AND ")
}


export interface DatabaseConstructorData {
    host: string | undefined, 
    port: number | undefined, 
    user: string | undefined, 
    password: string | undefined, 
    database?: string
}

export interface Database{
    query(query: string): Promise<unknown[]>
}

export interface CategoryInfo{
    id: number,
    name: string,
}

export interface CategoryWithSubcategories extends CategoryInfo{
    subcategories: string[]
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
