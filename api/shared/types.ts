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

export type ExpressResponse_Migration<T> = {
    success: boolean;
    message: string;
    data: T | null;
    totalPages: number | undefined;
    error?: string;
};
