export const toNumber = (value: any): number | undefined => {
    let res = parseInt(value, 10)
    if(isNaN(res)) return undefined
    return res
}

export const toNumberArray = (value: any[]): number[] | undefined => {
    for(let i = 0; i < value.length; ++i){
        let res = parseInt(value[i])
        if(isNaN(res)) return undefined
        value[i] = res
    }
    return value
}
