import { Collection, Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";
import { Review } from "../review/review.entity.js";
import { ExpressResponse_Migration, Sexo, UserRole } from "../shared/types.js";
import crypto from "crypto";
import { SALT_CONSTANT, SALT_DIGEST, SALT_ITERATIONS, SALT_KEYLEN } from "../constants.js";
import { z } from "zod";

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

    @Property({ type: "array" })
    reviewsEliminadas: NotificacionReview[] = [];

    @OneToMany(() => Review, (review) => review.usuario)
    reviews = new Collection<Review>(this);

    static schema = z.object({
        legajo: z.string().regex(/^\d{5}$/, "El legajo debe constar de 5 digitos"),
        nombre: z.string().regex(/^[a-zA-Z]+$/, "El nombre es requerido"),
        apellido: z.string().regex(/^[a-zA-Z]+$/, "El apellido es requerido"),
        username: z.string().min(1, "El username es requerido"),
        fechaNacimiento: z
            .string()
            .regex(/^(19|20)\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/, {
                message: "La fecha debe estar en formato YYYY/MM/DD.",
            })
            .refine(
                (dateString) => {
                    const inputDate = new Date(dateString.replace(/\//g, "-")); // Cambia '/' a '-' para compatibilidad con `Date`
                    const today = new Date();

                    // Verifica si la fecha es válida
                    if (isNaN(inputDate.getTime())) return false;

                    // Restar 16 años a la fecha actual para la verificación
                    today.setFullYear(today.getFullYear() - 18);
                    return inputDate <= today;
                },
                {
                    message: "Los usuarios deben ser mayores de 18 años",
                }
            ),
        password: z.string().min(1, "La contraseña es requerida"),
        sexo: z
            .string()
            .transform((value) => value.toLowerCase())
            .refine((value) => ["mujer", "hombre"].includes(value), {
                message: "El sexo debe ser 'Mujer' o 'Hombre'",
            })
            .transform((value) => {
                return value === "mujer" ? Sexo.Mujer : Sexo.Hombre;
            }),
        reviewsEliminadas: z.array(z.object({ id: z.string(), mensaje: z.string(), visto: z.boolean() })).optional(),
    });

    static parseSchema(json: Request["body"]): ExpressResponse_Migration<Usuario> {
        /*
         * Recieves a JSON object and returns an Review object
         * If the JSON object is not valid, returns null
         */

        const parseResult = Usuario.schema.safeParse(json);

        if (!parseResult.success) {
            return {
                success: false,
                message: "Error parsing json area",
                data: null,
                error: parseResult.error.errors,
                totalPages: undefined,
            };
        }

        const result = new Usuario(
            parseResult.data.nombre,
            parseResult.data.legajo,
            parseResult.data.apellido,
            parseResult.data.username,
            //@ts-ignore
            parseResult.data.fechaNacimiento,
            UserRole.Regular,
            parseResult.data.sexo,
            Usuario.hashPassword(parseResult.data.password)
        );

        return {
            success: true,
            message: "Success parsing json area",
            data: result,
            totalPages: undefined,
        };
    }

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
        this.reviewsEliminadas = [];
        this.borradoLogico = false;
    }

    public static hashPassword(unhashedPassword: string): string {
        return crypto.pbkdf2Sync(unhashedPassword, SALT_CONSTANT, SALT_ITERATIONS, SALT_KEYLEN, SALT_DIGEST).toString();
    }
}

export type NotificacionReview = { id: string; mensaje: string; visto: boolean };
