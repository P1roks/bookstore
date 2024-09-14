export interface searchParams{
    category: string,
    subcategory: string,
    languages: Language[],
    states: State[],
    minPrice: number,
    maxPrice: number,
}

enum Language{
    English = 0,
    Polish = 1,
}

enum State{
    New = 0,
    VeryGood = 1,
    Good = 2,
    Destroyed = 3,
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
