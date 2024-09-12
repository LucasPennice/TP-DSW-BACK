import { Collection, Entity, ManyToMany, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";
import { Sexo, UserRole } from "../shared/types.js";
import { Review } from "../review/review.entity.js";
import { Cursado } from "../cursado/cursado.entity.js";

@Entity()
export class Usuario {
    @PrimaryKey({ type: "uuid" })
    _id = v4();

    @Property()
    legajo: string;

    @Property()
    nombre: string;

    @Property()
    username: string;

    @Property()
    apellido: string;

    @Property()
    fechaNacimiento : Date // "DD/MM/YYY"

    @Property()
    sexo: Sexo;

    @Property()
    rol: UserRole;

    @Property()
    contraseña: string;

    @OneToMany(() => Review, (review) => review.usuario)
    reviews = new Collection<Review>(this);

    
    constructor(nombre: string, legajo: string, apellido: string, username: string, fechaNacimiento: Date, rol: UserRole, sexo: Sexo, contraseña: string) { 
        this.nombre = nombre
        this.legajo = legajo
        this.apellido = apellido
        this.username = username
        this.fechaNacimiento = fechaNacimiento
        this.rol = rol
        this.sexo = sexo
        this.contraseña = contraseña
    }
}
