import { Types } from "mongoose"
import { ICartSummary, ICartItem } from "./types"

export const toNumber = (value: any): number | undefined => {
    const res = parseInt(value, 10)
    return isNaN(res) ? undefined : res
}

export const toObjectId = (value: string): Types.ObjectId | undefined => {
    try{
        return new Types.ObjectId(value)
    }
    catch{
        return
    }
}

export const wrapArray = (value: string | undefined): string[] | null => value === undefined ? null : [value]

export const clamp = (no: number, min: number, max: number) => no > max ? max : no < min ? min : no

export const genSummary = (cartItems: ICartItem[]): ICartSummary => {
    const totalPrice = cartItems.reduce(
        (accum, currentVal) => accum + currentVal.orderQuantity * currentVal.price,
        0
    )
    const discountPercentage = clamp(Math.floor( totalPrice / 100 ) * 5, 0, 25)
    const finalPrice = (totalPrice * (100 - discountPercentage) / 100) + 12
    return {
        totalPrice,
        discountPercentage,
        finalPrice
    }
}
