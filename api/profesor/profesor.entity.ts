import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

export enum Sexo {
    Mujer = "Mujer",
    Hombre = "Hombre"
  }

@Entity()
export class Profesor{
    @PrimaryKey({ type: 'uuid' })
    _id = v4();

    @Property()
    nombre : String

    @Property()
    apellido : String

    @Property()
    fechaNacimiento : Date

    @Property()
    dni: Number

    @Property()
    cargos : String[]

    @Property()
    horariosDeClase: String[] // "DIA_SEMANA - HH:MM" formato 24hs
    
    @Property()
    puntuacionGeneral: Number

    @Property()
    sexo: Sexo

    constructor(nombre: String, apellido: String, fechaNacimiento: Date, dni: Number, cargos: String[], horariosDeClase: String[], puntuacionGeneral: Number, sexo: Sexo) { 
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