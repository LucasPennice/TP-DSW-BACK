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
        nombre: z.string().regex(/^(?=.*[a-zA-Z])[a-zA-Z0-9\s]+$/, "El nombre es requerido"),
        areaId: z.string().min(1, "Debe seleccionar un área"),
    });

    static parseSchema(
        body: Request["body"],
        method: Request["method"]
    ): ExpressResponse_Migration<Omit<Materia, "area" | "cursados" | "_id" | "borradoLogico">> {
        /*
         * Recieves a JSON object and returns an Area object
         * If the JSON object is not valid, returns null
         */
        const schemaToUse = method == "PATCH" ? Materia.schema.omit({ areaId: true }).strip() : Materia.schema;

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

        const result: Omit<Materia, "area" | "cursados" | "_id" | "borradoLogico"> = {
            nombre: parseResult.data.nombre,
        };

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
