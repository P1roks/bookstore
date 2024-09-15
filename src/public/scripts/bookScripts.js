function addToCart(e, id){
    e.stopPropagation()

    window.location.href = `/cart/add/${id}`
}

function seeProduct(id){
    window.location.href = `/book/${id}`
}
