import { db } from "..";
import { EBookLanguage, EBookState, IBookListItem, IFilterField, IFilters, ISearchParams, ISubcategory } from "../types";
import { DatabaseHandler } from "./db/handler";

const makeEnumField = (name: string, displayName: string, enumValues: string[]): IFilterField => ({
    name,
    displayName,
    entries: enumValues.map(option => ({
        queryValue: option,
        displayName: option,
        checked: false
    }))
})

export class SearchHandler{
    private static readonly stateField: IFilterField = makeEnumField("state", "Stan", Object.values(EBookState))
    private static readonly languageField: IFilterField = makeEnumField("language", "Język", Object.values(EBookLanguage))
    private query: ISearchParams

    public constructor(query: ISearchParams){
        this.query = query
    }

    async getFilteredBooks(): Promise<IBookListItem[]>{
        let filters: any[] = []

        for(const [key, val] of Object.entries(this.query)){
            switch (key as keyof ISearchParams){
                case "title":
                    filters.push({[key]: new RegExp(`.*${val}.*`, "i")})
                    break
                case "category":
                case "subcategories":
                    filters.push({[key]: val})
                    break
                case "extraFields":
                    for(const field of val){
                        filters.push({[field.name]: field.values})
                    }
                    break
                case "minPrice":
                    filters.push({price: {$gte: val}})
                    break
                case "maxPrice": 
                    filters.push({price: {$lte: val}})
                    break
            }
        }
        return await db.getBooksWithConstraint({$and: filters})
    }

    async getCurrentFilters(): Promise<IFilters>{
        const fields = [structuredClone(SearchHandler.stateField), structuredClone(SearchHandler.languageField)]
        if(this.query.extraFields){
            for(const searchField of this.query.extraFields){
                const selectedField = fields.find(field => field.name === searchField.name)
                if(selectedField){
                    for(const selected of searchField.values){
                        const found = selectedField.entries.find(f => f.queryValue === selected)
                        if(found){
                            found.checked = true
                        }
                    }
                }
            }
        }

        let res: IFilters = {
            searchText: this.query.title,
            minPrice: this.query.minPrice,
            maxPrice: this.query.maxPrice,
            fields,
        }

        if(this.query.category){
            const fullCategory = await db.getFullCategoryInfo(this.query.category) 
            if(fullCategory){
                res.selectedCategory = {
                    _id: this.query.category,
                    name: fullCategory.name,
                    subcategories: fullCategory.subcategories
                }
                if(this.query.subcategories){
                    const selectedSubcategoryIdx = res.selectedCategory.subcategories
                        .findIndex(sub => sub._id.equals(this.query.subcategories))
                    if(selectedSubcategoryIdx !== -1){
                        const selectedSubcategory = res.selectedCategory.subcategories[selectedSubcategoryIdx]
                        selectedSubcategory.selected = true
                        res.selectedCategory.subcategories.splice(selectedSubcategoryIdx, 1)
                        res.selectedCategory.subcategories.splice(0, 0, selectedSubcategory)
                    }
                }
            }
        }

        if(!res.selectedCategory){
            res.categories = DatabaseHandler.getCategoriesObject()
        }

        return res
    }
}
