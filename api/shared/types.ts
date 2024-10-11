export enum Sexo {
    Mujer = "Mujer",
    Hombre = "Hombre",
}

export enum TipoCursado {
    Practica = "Practica",
    Teoria = "Teoria",
}

export enum UserRole {
    Regular = "Regular",
    Administrador = "Administrador",
}

export type ExpressResponse<T> = {
    message: string;
    data: T | undefined;
    totalPages: number | undefined;
};
