import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Sexo } from '../shared/types.js';

@Entity()
export class Profesor{
    @PrimaryKey({ type: 'uuid' })
    _id = v4();

    @Property()
    nombre : string

    @Property()
    apellido : string

    @Property()
    fechaNacimiento : Date

    @Property()
    dni: number

    @Property()
    cursadas : string[]
    
    @Property()
    puntuacionGeneral: number

    @Property()
    sexo: Sexo

    constructor(nombre: string, apellido: string, fechaNacimiento: Date, dni: number, cursadas: string[], puntuacionGeneral: number, sexo: Sexo) { 
        this.nombre = nombre
        this.apellido = apellido
        this.fechaNacimiento = fechaNacimiento
        this.dni = dni
        this.cursadas = cursadas
        this.puntuacionGeneral = puntuacionGeneral
        this.sexo = sexo
    }

}