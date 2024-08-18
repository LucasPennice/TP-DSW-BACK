import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Cursado } from '../cursado/cursado.entity.js';

@Entity()
export class Materia{
    @PrimaryKey({ type: 'uuid' })
    _id = v4();

    @Property()
    nombre : string

    // @OneToMany(() => Cursado, cursado => cursado.materia)
    // cursados = new Collection<Cursado>(this);

    constructor(nombre: string) { 
        this.nombre = nombre
    }

}
