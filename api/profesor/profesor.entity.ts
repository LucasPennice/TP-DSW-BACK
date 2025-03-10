import { Entity, PrimaryKey, Property, OneToMany, Collection } from "@mikro-orm/core";
import { v4 } from "uuid";
import { ExpressResponse, Sexo } from "../shared/types.js";
import { Cursado } from "../cursado/cursado.entity.js";
import { z } from "zod";

@Entity()
export class Profesor {
    @PrimaryKey({ type: "uuid" })
    _id = v4();

    @Property()
    nombre: string;

    @Property()
    apellido: string;

    @Property()
    fechaNacimiento: Date;

    @Property()
    dni: number;

    @Property()
    borradoLogico: boolean;

    @OneToMany({ entity: () => Cursado, mappedBy: "profesor" })
    cursados = new Collection<Cursado>(this);

    @Property()
    puntuacionGeneral: number;

    @Property()
    reviewsRecibidas: number;

    @Property()
    sexo: Sexo;

    static schema = z.object({
        nombre: z.string().regex(/^[a-zA-Z\s]+$/, "El nombre es requerido"),
        apellido: z.string().regex(/^[a-zA-Z\s]+$/, "El apellido es requerido"),
        fechaNacimiento: z
            .date()
            .refine((value) => value.toISOString().split("T")[0] !== "1000-01-01", {
                message: "Fecha de nacimiento no válida",
            })
            .refine(
                (value) => {
                    const today = new Date();
                    const age = today.getFullYear() - value.getFullYear();
                    const month = today.getMonth() - value.getMonth();
                    const day = today.getDate() - value.getDate();

                    if (month < 0 || (month === 0 && day < 0)) {
                        return age > 18;
                    }

                    return age >= 18;
                },
                {
                    message: "Debe ser mayor de 18 años",
                }
            ),
        dni: z.number().refine((value) => value >= 10000000 && value <= 99999999, {
            message: "El DNI debe tener exactamente 8 dígitos",
        }),
        sexo: z
            .string()
            .transform((value) => value.toLowerCase())
            .refine((value) => ["mujer", "hombre"].includes(value), {
                message: "El sexo debe ser 'Mujer' o 'Hombre'",
            })
            .transform((value) => {
                return value === "mujer" ? Sexo.Mujer : Sexo.Hombre;
            }),
    });

    static parseSchema(json: Request["body"]): ExpressResponse<Profesor> {
        /*
         * Recieves a JSON object and returns an Profesor object
         * If the JSON object is not valid, returns null
         */

        const parseResult = Profesor.schema.safeParse(json);

        if (!parseResult.success) {
            return {
                success: false,
                message: "Error parsing json profesor",
                data: null,
                error: parseResult.error.errors,
                totalPages: undefined,
            };
        }

        const result = new Profesor(
            parseResult.data.nombre,
            parseResult.data.apellido,
            parseResult.data.fechaNacimiento,
            parseResult.data.dni,
            0,
            parseResult.data.sexo
        );

        return {
            success: true,
            message: "Success parsing json area",
            data: result,
            totalPages: undefined,
        };
    }

    constructor(nombre: string, apellido: string, fechaNacimiento: Date, dni: number, puntuacionGeneral: number, sexo: Sexo) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.fechaNacimiento = fechaNacimiento;
        this.dni = dni;
        this.puntuacionGeneral = puntuacionGeneral;
        this.sexo = sexo;
        this.borradoLogico = false;
        this.reviewsRecibidas = 0;
    }
}
