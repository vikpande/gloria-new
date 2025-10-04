import categoriesData from "@src/data/categories.json";
import { Category, CategoryOption } from "@src/types/categories";

const categories: Category[] = categoriesData as Category[];

export const getCategories = (): Category[] => {
    return categories;
};

export const getCategoryNames = (): string[] => {
    return categories.map(cat => cat.name);
};

export const getCategoryById = (id: string): Category | undefined => {
    return categories.find(cat => cat.id === id);
};

export const getCategoryByName = (name: string): Category | undefined => {
    return categories.find(cat => cat.name === name);
};

export const getCategoryOptions = (): CategoryOption[] => {
    return categories.map(cat => ({
        value: cat.name,
        label: cat.name
    }));
};

export const getCategoryWithAll = (): CategoryOption[] => {
    return [
        { value: "all", label: "All Categories" },
        ...getCategoryOptions()
    ];
};
export default categories;
