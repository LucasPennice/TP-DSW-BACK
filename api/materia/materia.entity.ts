import { Entity, PrimaryKey, Property, OneToMany, Collection, ManyToOne, Rel  } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Cursado } from '../cursado/cursado.entity.js';
import { Area } from '../area/area.entity.js';

@Entity()
export class Materia{
    @PrimaryKey({ type: 'uuid' })
    _id = v4();

    @Property()
    nombre! : string

    @OneToMany(() => Cursado, cursado => cursado.materia)
    cursados = new Collection<Cursado>(this);

    @ManyToOne({entity: () => Area})
    area!: Rel<Area>;

    constructor(nombre: string, area:Area) { 
        this.nombre = nombre
        this.area = area
    }
}
