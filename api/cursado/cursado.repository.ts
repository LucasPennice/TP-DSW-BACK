import { Repostitory } from "../shared/repository.js";
import { orm } from "../orm.js";
import { Cursado } from "./cursado.entity.js";

type _Body = Omit<Partial<Cursado>,"_id">;

export class MateriaRepository implements Repostitory<Cursado>{
    
    public async findAll(): Promise<Cursado[] | undefined> {
        const materias = await orm.em.findAll(Cursado)

        await orm.em.flush();

        return materias

    }
    
    public async findOne(item: { _id: string; }): Promise<Cursado | undefined> {
        
        const cursado = await orm.em.findOne(Cursado, item._id)

        await orm.em.flush();
        
        return cursado ?? undefined

    }
    
    public async add(item: Cursado): Promise<Cursado | undefined> {
        await orm.em.persist(item).flush();
        
        return item
    }
    
    public async update(item: { _id: string; }, body: _Body): Promise<Cursado | undefined> {

        const cursado = orm.em.getReference(Cursado, item._id);
    
        if (cursado){
            if (body.nombre) cursado.nombre = body.nombre
            await orm.em.flush()
        }
            
        return cursado
    }
    
    public async delete(item: {_id: string; }): Promise<Cursado | undefined> {
        
        const cursado = orm.em.getReference(Cursado, item._id);
    

        if(cursado) await orm.em.remove(cursado).flush();
        
        return cursado
    }
}