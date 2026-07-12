export type CategoryGroup = 'NEEDS' | 'WANTS' | 'SAVINGS';
export type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER'

export interface CategoryDto {
    name: string
    color: string
    transactionType: TransactionType
    categoryGroup: CategoryGroup
}

export interface Category extends CategoryDto {
    id: string
    parentId?: string | null
}

export interface SubCategoryDto {
    name: string
    parentId: string | null
}
