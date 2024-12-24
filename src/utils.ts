import { CartSummary, ICartItem } from "./types"

export const toNumber = (value: any): number | undefined => {
    const res = parseInt(value, 10)
    return isNaN(res) ? undefined : res
}

export const wrapArray = (value: number | undefined): number[] | undefined => value === undefined ? undefined : [value]

export const toNumberArray = (value: any[]): number[] | undefined => {
    for(let i = 0; i < value.length; ++i){
        const res = parseInt(value[i], 10)
        if(isNaN(res)) return undefined
        value[i] = res
    }
    return value
}

export const clamp = (no: number, min: number, max: number) => no > max ? max : no < min ? min : no

export const genSummary = (cartItems: ICartItem[]): CartSummary => {
    const totalPrice = cartItems.reduce(
        (accum, currentVal) => accum + currentVal.orderQuantity * currentVal.price,
        0
    )
    const discountPercentage = clamp(Math.floor( totalPrice / 100 ) * 5, 0, 25)
    const finalPrice = totalPrice * (100 - discountPercentage) / 100
    return {
        totalPrice,
        discountPercentage,
        finalPrice
    }
}
