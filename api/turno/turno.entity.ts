import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class Turno{
    @PrimaryKey({ type: 'uuid' })
    _id = v4();

    @Property()
    nombre : string

    constructor(nombre: string) { 
        this.nombre = nombre
    }

}
