import { Entity, PrimaryKey, Property, OneToMany, Collection, ManyToOne, Rel } from "@mikro-orm/core";
import { v4 } from "uuid";
import { Cursado } from "../cursado/cursado.entity.js";
import { Area } from "../area/area.entity.js";
import { z } from "zod";
import { ExpressResponse_Migration } from "../shared/types.js";

@Entity()
export class Materia {
    @PrimaryKey({ type: "uuid" })
    _id = v4();

    @Property()
    nombre!: string;

    @Property()
    borradoLogico: boolean;

    @OneToMany(() => Cursado, (cursado) => cursado.materia)
    cursados = new Collection<Cursado>(this);

    @ManyToOne({ entity: () => Area })
    area!: Rel<Area>;

    static schema = z.object({
        nombre: z.string().min(1, "El nombre es requerido"),
    });

    static parseSchema(json: Request["body"], area: Area): ExpressResponse_Migration<Materia> {
        /*
         * Recieves a JSON object and returns an Area object
         * If the JSON object is not valid, returns null
         */

        const parseResult = Materia.schema.safeParse(json);

        if (!parseResult.success) {
            return {
                success: false,
                message: "Error parsing json area",
                data: null,
                error: parseResult.error.errors.toString(),
                totalPages: undefined,
            };
        }

        const result = new Materia(parseResult.data.nombre, area);

        return {
            success: true,
            message: "Success parsing json area",
            data: result,
            totalPages: undefined,
        };
    }

    constructor(nombre: string, area: Area) {
        this.nombre = nombre;
        this.area = area;
        this.borradoLogico = false;
    }
}
