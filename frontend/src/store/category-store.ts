import type {Category} from "../types/category.ts";
import {create} from "zustand";
import {persist} from "zustand/middleware";

interface CategoryStore {
    categories: Category[]
    setCategories: (categories: Category[]) => void;
    addCategory: (category: Category) => void;
    deleteCategory: (category: Category) => void;
    updateCategory: (category: Category) => void;
}

export const useCategoryStore = create<CategoryStore>()(
    persist(
        (set) => ({
            categories: [],

            setCategories: (categories: Category[]) => set({categories: categories}),

            addCategory: (category: Category) => set(prev => ({
                categories: [...prev.categories, category],
            })),

            deleteCategory: (category: Category) => set((prev) => ({
                categories: prev.categories.filter(cat => cat.id !== category.id)
            })),

            updateCategory: (updatedCategory) => set((prev) => ({
                categories: prev.categories.map((cat) =>
                    cat.id === updatedCategory.id ? updatedCategory : cat
                )
            })),
        }),
        {name: 'financemate-categories'}
    )
)