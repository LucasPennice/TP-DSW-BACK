import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class Usuario{
    @PrimaryKey({ type: 'uuid' })
    _id = v4();

    @Property()
    legajo: string
    // integer?
    
    @Property()
    nombre : string
    
    constructor(nombre: string, legajo: string) { 
        this.nombre = nombre
        this.legajo = legajo
    }
}