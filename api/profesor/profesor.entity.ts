import { Entity, PrimaryKey, Property, OneToMany, Collection } from "@mikro-orm/core";
import { v4 } from "uuid";
import { Sexo } from "../shared/types.js";
import { Cursado } from "../cursado/cursado.entity.js";

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
    sexo: Sexo;

    constructor(nombre: string, apellido: string, fechaNacimiento: Date, dni: number, puntuacionGeneral: number, sexo: Sexo) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.fechaNacimiento = fechaNacimiento;
        this.dni = dni;
        this.puntuacionGeneral = puntuacionGeneral;
        this.sexo = sexo;
        this.borradoLogico = false;
    }
}
