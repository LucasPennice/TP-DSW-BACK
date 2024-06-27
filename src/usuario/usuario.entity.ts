import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class Usuario{
    @PrimaryKey({ type: 'uuid' })
    _id = v4();

    @Property()
    legajo: String
    // integer?
    
    @Property()
    nombre : String
    
    constructor(nombre: String, legajo: String) { 
        this.nombre = nombre
        this.legajo = legajo
    }
}