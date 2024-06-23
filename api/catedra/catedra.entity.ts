import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class Catedra{
    @PrimaryKey({ type: 'uuid' })
    _id = v4();

    @Property()
    nombre : String

    constructor(nombre: String) { 
        this.nombre = nombre
    }

}