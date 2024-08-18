import { Entity, ManyToOne, PrimaryKey, Property, Rel } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Usuario } from '../usuario/usuario.entity.js';

@Entity()
export class Review{
    @PrimaryKey({ type: 'uuid' })
    _id = v4();

    @Property()
    descripcion : string

    @Property()
    puntuacion : number
    
    @ManyToOne({entity: () => Usuario})
    usuario!: Rel<Usuario>;

    constructor(descripcion: string, puntuacion: number, usuario: Usuario) { 
        this.descripcion = descripcion
        this.puntuacion = puntuacion
        this.usuario = usuario
    }

}
