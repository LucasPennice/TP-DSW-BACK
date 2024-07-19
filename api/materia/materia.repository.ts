import { Repostitory } from "../shared/repository.js";
import { orm } from "../orm.js";
import { Materia } from "./materia.entity.js";

type _Body = Omit<Partial<Materia>,"_id">;

export class MateriaRepository implements Repostitory<Materia>{
    
    public async findAll(): Promise<Materia[] | undefined> {
        const materias = await orm.em.findAll(Materia)

        await orm.em.flush();

        return materias

    }
    
    public async findOne(item: { _id: string; }): Promise<Materia | undefined> {
        
        const materia = await orm.em.findOne(Materia, item._id)

        await orm.em.flush();
        
        return materia ?? undefined

    }
    
    public async add(item: Materia): Promise<Materia | undefined> {
        await orm.em.persist(item).flush();
        
        return item
    }
    
    public async update(item: { _id: string; }, body: _Body): Promise<Materia | undefined> {

        const materia = orm.em.getReference(Materia, item._id);
    
        if (materia){
            if (body.nombre) materia.nombre = body.nombre
            await orm.em.flush()
        }
            
        return materia
    }
    
    public async delete(item: {_id: string; }): Promise<Materia | undefined> {
        
        const materia = orm.em.getReference(Materia, item._id);
    

        if(materia) await orm.em.remove(materia).flush();
        
        return materia
    }
}