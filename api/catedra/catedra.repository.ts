import { Repostitory } from "../shared/repository.js";
import { Catedra } from "./catedra.entity.js";
import { orm } from "../orm.js";

type _Body = Omit<Partial<Catedra>,"_id">;

export class CatedraRepository implements Repostitory<Catedra>{
    
    public async findAll(): Promise<Catedra[] | undefined> {
        const catedras = await orm.em.findAll(Catedra)

        await orm.em.flush();

        return catedras

    }
    
    public async findOne(item: { _id: string; }): Promise<Catedra | undefined> {
        
        const catedra = await orm.em.findOne(Catedra, item._id)

        await orm.em.flush();
        
        return catedra ?? undefined

    }
    
    public async add(item: Catedra): Promise<Catedra | undefined> {
        await orm.em.persist(item).flush();
        
        return item
    }
    
    public async update(item: { _id: string; }, body: _Body): Promise<Catedra | undefined> {

        const catedra = orm.em.getReference(Catedra, item._id);
    
        if (catedra){
            if (body.nombre) catedra.nombre = body.nombre
            await orm.em.flush()
        }
            
        return catedra
    }
    
    public async delete(item: {_id: string; }): Promise<Catedra | undefined> {
        
        const catedra = orm.em.getReference(Catedra, item._id);
    

        if(catedra) await orm.em.remove(catedra).flush();
        
        return catedra
    }
}