import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import type { Rel } from "@mikro-orm/core";
import { v4 } from "uuid";
import { Materia } from "../materia/materia.entity.js";
import { Profesor } from "../profesor/profesor.entity.js";
import { Review } from "../review/review.entity.js";
import { ExpressResponse, TipoCursado } from "../shared/types.js";
import { z } from "zod";
import { primeraLetraMayuscula } from "./cursado.controller.js";

@Entity()
export class Cursado {
    @PrimaryKey({ type: "uuid" })
    _id = v4();

    @Property()
    diaCursado!: string;

    @Property()
    horaInicio!: string;

    @Property()
    horaFin!: string;

    @Property()
    comision!: number;

    @Property()
    turno!: string;

    @Property()
    año!: number;

    @Property()
    tipoCursado!: TipoCursado;

    @Property()
    borradoLogico: boolean;

    @ManyToOne({ entity: () => Materia })
    materia!: Rel<Materia>;

    @ManyToOne({ entity: () => Profesor })
    profesor!: Rel<Profesor>;

    @OneToMany(() => Review, (review) => review.cursado)
    reviews = new Collection<Review>(this);

    static schema = z.object({
        diaCursado: z
            .string()
            .refine((value) => ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado"].includes(value.toLowerCase()), {
                message: "El día debe ser uno de los días válidos.",
            })
            .transform((value) => primeraLetraMayuscula(value.toLowerCase())),
        horaInicio: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "La hora de inicio debe ser del tipo xx:xx"),
        horaFin: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "La hora de fin debe ser del tipo xx:xx"),
        comision: z.number().refine((value) => value >= 100 && value <= 510, {
            message: "La comisión debe tener exactamente 3 dígitos",
        }),
        turno: z
            .string()
            .refine((value) => ["mañana", "tarde", "noche"].includes(value.toLowerCase()), {
                message: "El turno debe ser mañana, tarde o noche.",
            })
            .transform((value) => primeraLetraMayuscula(value.toLowerCase())),
        año: z.number().refine((value) => value >= 2000 && value <= 2025, {
            message: "El año debe tener exactamente 4 dígitos",
        }),
        tipoCursado: z
            .string()
            .transform((value) => value.toLowerCase())
            .refine((value) => ["teoria", "practica"].includes(value), {
                message: "El tipo debe ser 'Teoria' o 'Practica'",
            })
            .transform((value) => {
                return value === "teoria" ? TipoCursado.Teoria : TipoCursado.Practica;
            }),
        profesorId: z.string().min(1, "Debe seleccionar un profesor"),
        materiaId: z.string().min(1, "Debe seleccionar una materia"),
    });

    static parseSchema(
        body: Request["body"],
        method: Request["method"]
    ): ExpressResponse<Omit<Cursado, "materia" | "profesor" | "reviews" | "_id" | "borradoLogico">> {
        /*
         * Recieves a JSON object and returns an Area object
         * If the JSON object is not valid, returns null
         */

        const schemaToUse = method == "PATCH" ? Cursado.schema.omit({ profesorId: true, materiaId: true }).strip() : Cursado.schema;

        let parseResult = schemaToUse.safeParse(body);

        if (!parseResult.success) {
            return {
                success: false,
                message: "Error parsing json area",
                data: null,
                error: parseResult.error.errors,
                totalPages: undefined,
            };
        }

        const result: Omit<Cursado, "materia" | "profesor" | "reviews" | "_id" | "borradoLogico"> = {
            diaCursado: parseResult.data.diaCursado,
            horaInicio: parseResult.data.horaInicio,
            horaFin: parseResult.data.horaFin,
            comision: parseResult.data.comision,
            turno: parseResult.data.turno,
            año: parseResult.data.año,
            tipoCursado: parseResult.data.tipoCursado,
        };

        return {
            success: true,
            message: "Success parsing json area",
            data: result,
            totalPages: undefined,
        };
    }

    constructor(
        diaCursado: string,
        horaInicio: string,
        horaFin: string,
        comision: number,
        turno: string,
        año: number,
        materia: Materia,
        profesor: Profesor,
        tipoCursado: TipoCursado
    ) {
        this.diaCursado = diaCursado;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.comision = comision;
        this.turno = turno;
        this.año = año;
        this.materia = materia;
        this.profesor = profesor;
        this.tipoCursado = tipoCursado;
        this.borradoLogico = false;
    }
}
