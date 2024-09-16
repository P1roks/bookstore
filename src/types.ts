export interface DatabaseConstructorData {
    host: string | undefined, 
    port: number | undefined, 
    user: string | undefined, 
    password: string | undefined, 
    database: string
}

export interface Database{
    query(query: string): Promise<unknown[]>
    format(query: string, data: any): string
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

export interface CategoryInfoFull{
    id: number,
    name: string,
    subcategories: BookProperty[],
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

