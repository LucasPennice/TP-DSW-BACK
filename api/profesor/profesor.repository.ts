import { orm } from "../orm.js";
import { Repostitory } from "../shared/repository.js";
import { Profesor } from "./profesor.entity.js";

type _Body = Omit<Partial<Profesor>,"_id">;

export class ProfesorRepository implements Repostitory<Profesor>{
    
    public async findAll(): Promise<Profesor[] | undefined> {
        const profesores = await orm.em.findAll(Profesor)

        await orm.em.flush();

        return profesores

    }
    
    public async findOne(item: { _id: string; }): Promise<Profesor | undefined> {
        
        const profesor = await orm.em.findOne(Profesor, item._id)

        await orm.em.flush();
        
        return profesor ?? undefined

    }
    
    
    public async add(item: Profesor): Promise<Profesor | undefined> {
        await orm.em.persist(item).flush();
        
        return item
    }
    
    public async update(item: { _id: string; }, body: _Body): Promise<Profesor | undefined> {

        const profesor = orm.em.getReference(Profesor, item._id);
    
        if (profesor){
            if (body.fechaNacimiento) profesor.fechaNacimiento = body.fechaNacimiento
            if (body.nombre) profesor.nombre = body.nombre
            if (body.apellido) profesor.apellido = body.apellido
            if (body.dni) profesor.dni = body.dni
            if (body.cursados) profesor.cursados = body.cursados
            if (body.puntuacionGeneral) profesor.puntuacionGeneral = body.puntuacionGeneral
            if (body.sexo) profesor.sexo = body.sexo
            await orm.em.flush()
        }
            
        return profesor
    }
    
    public async delete(item: {_id: string; }): Promise<Profesor | undefined> {
        
        const profesor = orm.em.getReference(Profesor, item._id);
    

        if(profesor) await orm.em.remove(profesor).flush();
        
        return profesor
    }
}