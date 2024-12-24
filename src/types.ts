import express from 'express';
import { Types } from 'mongoose';

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


export interface User{
    email: string
}

export interface AuthRequest<ReqBody = any> extends express.Request<{}, {}, ReqBody>{
    loginError?: string,
    registerError?: string
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

export enum BookState{
    NEW = "nowy",
    VGOOD = "bardzo dobry",
    GOOD = "dobry",
    BAD = "zniszczony"
}

// MONGOOSE TYPES
export interface IUser{
    email: string,
    password: string
}

export interface IBook{
    _id: Types.ObjectId,
    title: string,
    author: string,
    description: string,
    language: Types.ObjectId,
    category: Types.ObjectId,
    state: BookState,
    price: number,
    quantity: number,
    tome_info: {
       tome_number: number,
       tome_group: number
    } | undefined
}

export interface ILanguage{
    _id: Types.ObjectId,
    name: string 
}

export interface ICategory{
    _id: Types.ObjectId,
    name: string,
    subcategories: [
        name: string
    ]
}

export interface IBookListItem{
    _id: Types.ObjectId,
    title: string,
    author: string,
    price: number,
    state: BookState,
}

export interface IBookFull{
    _id: Types.ObjectId,
    title: string,
    author: string,
    description: string,
    language: string,
    category: string,
    subcategories: string[],
    state: BookState,
    price: number,
    quantity: number,
    tome_info: {
       tome_number: number,
       tome_group: number
    } | undefined
}
