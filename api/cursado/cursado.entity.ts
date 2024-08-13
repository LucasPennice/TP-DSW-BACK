import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class Cursado{
    @PrimaryKey({ type: 'uuid' })
    _id = v4();
   
    @Property()
    diaCursado : string

    @Property()
    horaCursado : string[]

    @Property()
    comision : number

    @Property()
    turno : string

    @Property()
    año : number

    constructor(diaCursado: string, horaCursado : string[], comision : number, turno : string, año : number) { 
        this.diaCursado = diaCursado
        this.horaCursado = horaCursado
        this.comision = comision
        this.turno = turno
        this.año = año
    }

}
