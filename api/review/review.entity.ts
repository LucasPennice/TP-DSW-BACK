import { Entity, ManyToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { v4 } from "uuid";
import { Usuario } from "../usuario/usuario.entity.js";
import { Cursado } from "../cursado/cursado.entity.js";

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
