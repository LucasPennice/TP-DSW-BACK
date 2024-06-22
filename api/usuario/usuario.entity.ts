import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class Usuario{
    @PrimaryKey({ type: 'uuid' })
    _id = v4();

    @Property()
    legajo: String
    
    @Property()
    nombre : String
    
    constructor() { 
        this.nombre = "Peter"
        this.legajo = "50977"
    }
}