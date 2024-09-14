export class Cart{
    #items
    /*
    [
        {
            bookId: 1;
            quantity: 3;
        },
        {
            bookId: 2;
            quantity: 1;
        },
    ]
    */

    constructor(){
        this.#items = []
    }

    addItem(){

    }

    removeItem(id){

    }

    clear(){
        this.#items = []
    }
}

