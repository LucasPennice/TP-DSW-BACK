import { Collection, Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";
import { Materia } from "../materia/materia.entity.js";
import { ExpressResponse_Migration } from "../shared/types.js";
import { z } from "zod";

@Entity()
export class Area {
    @PrimaryKey({ type: "uuid" })
    _id = v4();

    @Property()
    nombre: string;

    @Property()
    borradoLogico: boolean;

    @OneToMany(() => Materia, (materia) => materia.area)
    materias = new Collection<Materia>(this);

    constructor(nombre: string) {
        this.nombre = nombre;
        this.borradoLogico = false;
    }

    static schema = z.object({
        nombre: z.string().min(1, "El nombre es requerido"),
    });

    static parseSchema(json: Request["body"]): ExpressResponse_Migration<Area> {
        /*
         * Recieves a JSON object and returns an Area object
         * If the JSON object is not valid, returns null
         */

        const parseResult = Area.schema.safeParse(json);

        if (!parseResult.success) {
            return {
                success: false,
                message: "Error parsing json area",
                data: null,
                error: parseResult.error.errors.toString(),
                totalPages: undefined,
            };
        }

        const result = new Area(parseResult.data.nombre);

        return {
            success: true,
            message: "Success parsing json area",
            data: result,
            totalPages: undefined,
        };
    }
}
