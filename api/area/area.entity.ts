import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Materia } from '../materia/materia.entity.js';

@Entity()
export class Area{
    @PrimaryKey({ type: 'uuid' })
    _id = v4();

    @Property()
    nombre : string

    @OneToMany(() => Materia, materia => materia.area)
    materias = new Collection<Materia>(this);

    constructor(nombre: string) { 
        this.nombre = nombre
    }

}
