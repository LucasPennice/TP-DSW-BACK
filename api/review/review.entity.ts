import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class Review{
    @PrimaryKey({ type: 'uuid' })
    _id = v4();

    @Property()
    descripcion : string

    @Property()
    puntuacion : number

    constructor(descripcion: string, puntuacion: number) { 
        this.descripcion = descripcion
        this.puntuacion = puntuacion
    }

}
