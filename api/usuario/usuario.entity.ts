import { Collection, Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";
import { Review } from "../review/review.entity.js";
import { Sexo, UserRole } from "../shared/types.js";
import crypto from "crypto";
import { SALT_CONSTANT, SALT_DIGEST, SALT_ITERATIONS, SALT_KEYLEN } from "../constants.js";

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
    fechaNacimiento: Date; // "DD/MM/YYY"

    @Property()
    sexo: Sexo;

    @Property()
    rol: UserRole;

    @Property()
    hashed_password: string;

    @Property()
    borradoLogico: boolean;

    @OneToMany(() => Review, (review) => review.usuario)
    reviews = new Collection<Review>(this);

    constructor(
        nombre: string,
        legajo: string,
        apellido: string,
        username: string,
        fechaNacimiento: Date,
        rol: UserRole,
        sexo: Sexo,
        hashed_password: string
    ) {
        this.nombre = nombre;
        this.legajo = legajo;
        this.apellido = apellido;
        this.username = username;
        this.fechaNacimiento = fechaNacimiento;
        this.rol = rol;
        this.sexo = sexo;
        this.hashed_password = hashed_password;
        this.borradoLogico = false;
    }

    public static hashPassword(unhashedPassword: string): string {
        return crypto.pbkdf2Sync(unhashedPassword, SALT_CONSTANT, SALT_ITERATIONS, SALT_KEYLEN, SALT_DIGEST).toString();
    }
}
