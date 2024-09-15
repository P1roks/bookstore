import mysql, { QueryResult } from 'mysql2';

interface SearchParamOptions{
    tableName: string,
    columnName: string
    operation?: Operation 
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
        }),
        subcategory: ConstraintFactory.createSearchParam<number>({
            tableName: "subcategories",
            columnName: "id",
        }),
        language: ConstraintFactory.createSearchParam<number[]>({
            tableName: "languages",
            columnName: "id",
        }),
        states: ConstraintFactory.createSearchParam<State[]>({
            tableName: "books",
            columnName: "state",
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
           return mysql.format(`?.? ${param.operation ?? Operation.Equal} ?`, [param.tableName, param.columnName, param.lookupValue])
       }
       else{
           let placeholders = param.lookupValue.map(() => "?").join(", ") 
           let sql = mysql.format(`?.? IN (${placeholders})`, [param.tableName, param.columnName, ...param.lookupValue])
           return sql
       }
    }
    
    public static getSQLConstraints = (constraints: {name: string, value: any}[]): string =>
        constraints.map(({name, value}) => {
            try{
                return ConstraintFactory.toSQL(
                    ConstraintFactory.searchParams[name](value)
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
    query(query: string): Promise<unknown[] | null>
}

export interface CategoryInfo{
    id: number,
    name: string,
}
