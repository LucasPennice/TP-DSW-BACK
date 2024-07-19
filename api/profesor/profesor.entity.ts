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
    cargos : string[]

    @Property()
    horariosDeClase: string[] // "DIA_SEMANA - HH:MM" formato 24hs
    
    @Property()
    puntuacionGeneral: number

    @Property()
    sexo: Sexo

    constructor(nombre: string, apellido: string, fechaNacimiento: Date, dni: number, cargos: string[], horariosDeClase: string[], puntuacionGeneral: number, sexo: Sexo) { 
        this.nombre = nombre
        this.apellido = apellido
        this.fechaNacimiento = fechaNacimiento
        this.dni = dni
        this.cargos = cargos
        this.horariosDeClase = horariosDeClase
        this.puntuacionGeneral = puntuacionGeneral
        this.sexo = sexo
    }

}