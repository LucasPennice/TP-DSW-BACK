import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Sexo, UserRole } from '../shared/types.js';

@Entity()
export class Usuario{
    @PrimaryKey({ type: 'uuid' })
    _id = v4();

    @Property()
    legajo: string
    
    @Property()
    nombre : string

    @Property()
    apellido : string

    @Property()
    username : string

    @Property()
    fechaNacimiento : string // "DD/MM/YYY"

    @Property()
    sexo : Sexo

    @Property()
    rol : UserRole
    
    constructor(nombre: string, legajo: string, apellido: string, username: string, fechaNacimiento: string, rol: UserRole, sexo: Sexo) { 
        this.nombre = nombre
        this.legajo = legajo
        this.apellido = apellido
        this.username = username
        this.fechaNacimiento = fechaNacimiento
        this.rol = rol
        this.sexo = sexo
    }
}