import type {Category, CategoryDto, SubCategoryDto} from "../types/category.ts";
import api from "./api.ts";

export const categoryService = {
    createCategory: async(data: CategoryDto): Promise<Category> => {
        const response = await api.post<Category>(
            `categories`,
            data
        )
        return response.data
    },

    createSubCategory: async(data: SubCategoryDto): Promise<Category> => {
        const response = await api.post<Category>(
            `categories/sub-category`,
            data
        )
        return response.data
    },

    updateCategory: async(data: CategoryDto, id: string): Promise<Category> => {
        const response = await api.put<Category>(
            `categories/${id}`,
            data
        )
        return response.data
    },

    getCategories: async(): Promise<Category[]> => {
        const response = await api.get<Category[]>(
            `categories`,
        )
        return response.data
    },

    deleteCategory: async(id: string): Promise<void> => {
        const response = await api.delete(
            `categories/${id}`
        )
        return response.data
    }

}