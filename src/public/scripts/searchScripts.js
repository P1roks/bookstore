function toggleSubcategories(elem){
    subcategories = elem.parentElement.querySelector("ul")
    subcategories.style.display = subcategories.style.display === "block" ? "none" : "block";
}

function filterBooks(){
    let currentFilters = new URLSearchParams(window.location.search)

    let filters = {
        title: document.querySelector("#search input").value || undefined,
        state: Array.prototype.map.call(document.querySelectorAll("input[name='state']:checked"), i => i.value),
        language: Array.prototype.map.call(document.querySelectorAll("input[name='language']:checked"), i => i.value),
        minPrice: document.querySelector(".filter-section + .price #min-price").value || undefined,
        maxPrice: document.querySelector(".filter-section + .price #max-price").value || undefined
    }

    for(let [key, value] of Object.entries(filters).filter(([_, val]) => val)){
        if(Array.isArray(value)){
            currentFilters.delete(key)
            value.forEach(v => currentFilters.append(key, v))
        }
        else{
            currentFilters.set(key, value)
        }
    }

    console.log(currentFilters.toString())

    // window.location.href = `/search?${currentFilters.toString()}`
}

function changeCategory(){

}
