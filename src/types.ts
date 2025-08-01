import express from 'express';

export interface SQLDatabaseSettings {
    host: string | undefined, 
    port: number | undefined, 
    user: string | undefined, 
    password: string | undefined, 
    database: string | undefined
}

export interface Database{
    query(query: string): Promise<unknown[]>
    format(query: string, data: any[]): string
    formattedQuery(query: string, data: any[]): Promise<unknown[]>
}

export interface BookProperty{
    id: number,
    name: string,
    checked?: boolean,
}

export interface CategoryInfoFull{
    id: number,
    name: string,
    subcategories: BookProperty[],
}

export interface BookDetail{
    id: number,
    title: string,
    author: string,
    description: string,
    category: string,
    subcategory: string,
    language: string,
    state: string,
    price: number,
    quantity: number,
    tomeNumber: number | null,
    tomeGroup: number | null,
}

export interface BookListItem{
    id: number,
    title: string,
    author: string,
    price: number,
    state: string,
}

export interface User{
    email: string
}

export interface AuthRequest<ReqBody = any> extends express.Request<{}, {}, ReqBody>{
    loginError?: string,
    registerError?: string
}

// object used internally in backend
export interface LoginUser{
    email: string,
    plainPassword: string
}

// object send in by form to backend
export interface LoginUserTransfer{
    email: string,
    password: string
}

// object send in by form to backend
export interface RegisterUserTransfer{
    email: string,
    password: string,
    passwordRepeat: string,
    terms?: "on",
}

export interface SessionCart{
    items: { [bookId: number]: SessionCartItem } // cart.items[bookId] = quantity
}

export interface SessionCartItem{
    quantity: number,
    maxQuantity: number,
}

export interface CartBookTransfer{
    bookId: string,
    quantity?: string,
}

export interface CartItem{
    id: number,
    title: string,
    price: number,
    maxQuantity: number,
    quantity: number,
}

export interface CartSummary{
    totalPrice: number,
    discountPercentage: number,
    finalPrice: number,
}
