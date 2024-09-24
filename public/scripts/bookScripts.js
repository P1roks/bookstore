function seeProduct(id){
    window.location.href = `/book/${id}`
}

function changeQuantity(elem, change){
    const inp = elem.parentElement.querySelector("input[type='number']")
    const val = parseInt(inp.value)
    if(change < 0 && val <= 1) return
    if(change > 0 && val >= inp.max) return
    inp.value = parseInt(inp.value) + change
}
