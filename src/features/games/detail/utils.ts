export * from "./predicates";

export const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
};