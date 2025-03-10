import { Entity, ManyToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { v4 } from "uuid";
import { Usuario } from "../usuario/usuario.entity.js";
import { Cursado } from "../cursado/cursado.entity.js";
import { z } from "zod";
import { ExpressResponse } from "../shared/types.js";

@Entity()
export class Review {
    @PrimaryKey({ type: "uuid" })
    _id = v4();

    @Property()
    descripcion: string;

    @Property()
    puntuacion: number;

    @Property()
    censurada: boolean;

    @Property()
    fecha: Date;

    @Property()
    borradoLogico: boolean;

    @ManyToOne({ entity: () => Usuario })
    usuario!: Rel<Usuario>;

    @ManyToOne({ entity: () => Cursado })
    cursado!: Rel<Cursado>;

    static schema = z.object({
        descripcion: z.string().min(1, "La descripcion es obligatoria"),
        puntuacion: z.number().refine((value) => value >= 0 && value <= 5, {
            message: "El puntaje debe estar entre 0-5",
        }),
    });

    static parseSchema(
        json: Request["body"]
    ): ExpressResponse<Omit<Review, "usuario" | "cursado" | "fecha" | "_id" | "borradoLogico" | "censurada">> {
        /*
         * Recieves a JSON object and returns an Review object
         * If the JSON object is not valid, returns null
         */

        const parseResult = Review.schema.safeParse(json);

        if (!parseResult.success) {
            return {
                success: false,
                message: "Error parsing json area",
                data: null,
                error: parseResult.error.errors,
                totalPages: undefined,
            };
        }

        const result: Omit<Review, "usuario" | "cursado" | "fecha" | "_id" | "borradoLogico" | "censurada"> = {
            descripcion: parseResult.data.descripcion,
            puntuacion: parseResult.data.puntuacion,
        };

        return {
            success: true,
            message: "Success parsing json area",
            data: result,
            totalPages: undefined,
        };
    }

    constructor(descripcion: string, puntuacion: number, usuario: Usuario, cursado: Cursado, censurada: boolean) {
        this.descripcion = descripcion;
        this.puntuacion = puntuacion;
        this.usuario = usuario;
        this.cursado = cursado;
        this.borradoLogico = false;
        this.censurada = censurada;
        this.fecha = new Date();
    }
}
