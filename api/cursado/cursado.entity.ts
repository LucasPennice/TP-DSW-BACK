import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection } from '@mikro-orm/core';
import type { Rel } from '@mikro-orm/core';
import { v4 } from 'uuid';
import {Materia} from "../materia/materia.entity.js"
import { Profesor } from '../profesor/profesor.entity.js';
import { Review } from '../review/review.entity.js';

@Entity()
export class Cursado {
    @PrimaryKey({ type: 'uuid' })
    _id = v4();
   
    @Property()
    diaCursado!: string

    @Property()
    horaInicio!: string

    @Property()
    horaFin!: string

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

    @OneToMany(() => Review, review => review.cursado)
    reviewes = new Collection<Review>(this);
    

    constructor(diaCursado: string, horaInicio : string, horaFin: string,comision : number, turno : string, año : number, materia: Materia, profesor: Profesor) { 
        this.diaCursado = diaCursado
        this.horaInicio = horaInicio
        this.horaFin = horaFin
        this.comision = comision
        this.turno = turno
        this.año = año
        this.materia = materia
        this.profesor = profesor
    }

}
