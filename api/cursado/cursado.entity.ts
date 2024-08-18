import { Entity, PrimaryKey, Property, ManyToOne, Collection, ManyToMany } from '@mikro-orm/core';
import type { Rel } from '@mikro-orm/core';
import { v4 } from 'uuid';
import {Materia} from "../materia/materia.entity.js"
import { Profesor } from '../profesor/profesor.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';

@Entity()
export class Cursado {
    @PrimaryKey({ type: 'uuid' })
    _id = v4();
   
    @Property()
    diaCursado!: string

    @Property()
    horaCursado!: string

    @Property()
    comision!: number

    @Property()
    turno!: string

    @Property()
    año!: number
    
    @ManyToOne({entity: () => Materia})
    materia!: Rel<Materia>;
    
    @ManyToOne({entity: () => Profesor})
    profesor!: Rel<Profesor>;
    
    @ManyToMany()
    usuarios = new Collection<Usuario>(this);

    constructor(diaCursado: string, horaCursado : string, comision : number, turno : string, año : number, materia: Materia, profesor: Profesor) { 
        this.diaCursado = diaCursado
        this.horaCursado = horaCursado
        this.comision = comision
        this.turno = turno
        this.año = año
        this.materia = materia
        this.profesor = profesor
    }

}
