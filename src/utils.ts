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
