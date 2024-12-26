import express from 'express';
import { ObjectId } from 'mongodb';

export enum EBookState{
    NEW = "nowy",
    VGOOD = "bardzo dobry",
    GOOD = "dobry",
    BAD = "zniszczony"
}

export enum EBookLanguage{
    ENGLISH = "Angielski",
    POLISH = "Polski",
}

export enum ESortOptions{
    DEFAULT = 0,
    ASC_PRICE = 1,
    DESC_PRICE = 2,
    ASC_TITLE = 3,
    DESC_TITLE = 4,
}

export interface IAuthRequest<ReqBody = any> extends express.Request<{}, {}, ReqBody>{
    loginError?: string,
    registerError?: string
}

// object send in by form to backend
export interface IRegisterUserTransfer{
    email: string,
    password: string,
    passwordRepeat: string,
    terms?: "on",
}

export interface ICartBookTransfer{
    bookId: string,
    quantity?: string,
}

export interface ICartSummary{
    totalPrice: number,
    discountPercentage: number,
    finalPrice: number,
}

export interface IUser{
    email: string,
    password: string
}

export interface SessionUser{
    email: string
}

export interface IBook{
    _id: ObjectId,
    title: string,
    author: string,
    description: string,
    category: ObjectId,
    subcategories: ObjectId[],
    price: number,
    quantity: number,
    tomeNumber: number | null,
    tomeGroup: number | null,
    image: string | null,
    language: EBookLanguage,
    state: EBookState,
}

export interface ISubcategory{
    _id: ObjectId
    name: string
}

export interface ICategoryFull{
    _id: ObjectId,
    name: string,
    subcategories: ISubcategory[]
}

export interface ICategory{
    _id: ObjectId,
    name: string,
}

export interface IBookListItem{
    _id: ObjectId,
    title: string,
    author: string,
    price: number,
    state: EBookState,
    image: string | null,
}

export interface IBookFull{
    _id: ObjectId,
    title: string,
    author: string,
    description: string,
    category: string,
    subcategories: string[],
    price: number,
    quantity: number,
    tomeNumber: number | null,
    tomeGroup: number | null
    image: string | null,
    language: EBookLanguage,
    state: EBookState,
}

export interface ISessionCartItem{
    orderQuantity: number,
    quantity: number,
}

export interface ISessionCart{
    items: { [bookId: string]: ISessionCartItem } // cart.items[bookId] = quantity
}

export interface ICartItem{
    _id: ObjectId,
    title: string,
    price: number,
    quantity: number,
    orderQuantity: number,
}

interface IEntry{
    queryValue: string
    displayName: string,
    checked: boolean,
}

export interface IFilterField{
    name: string,
    displayName: string,
    entries: IEntry[]
}

export interface IFilters{
    searchText?: string,
    minPrice?: number,
    maxPrice?: number,
    fields?: IFilterField[],
    sort?: ESortOptions,
    selectedCategory?: {
        _id: ObjectId,
        name: string,
        subcategories: {
            _id: ObjectId,
            name: string,
            selected?: boolean
        }[]
    }
    categories?: {
        queryValue: string,
        name: string
    }[]
}

export interface ISearchParams{
    category?: ObjectId,
    subcategories?: ObjectId,
    title?: string,
    minPrice?: number,
    maxPrice?: number,
    sort?: ESortOptions,
    extraFields?: {
        name: string,
        values: string[]
    }[]
}
