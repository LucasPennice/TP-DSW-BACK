import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class Comision{
    @PrimaryKey({ type: 'uuid' })
    _id = v4();

    @Property()
    numero : number

    constructor(numero: number) { 
        this.numero = numero
    }

}
