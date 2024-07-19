import { Repostitory } from "../shared/repository.js";
import { Comision } from "./comision.entity.js";
import { orm } from "../orm.js";

type _Body = Omit<Partial<Comision>,"_id">;

export class ComisionRepository implements Repostitory<Comision>{
    
    public async findAll(): Promise<Comision[] | undefined> {
        const comisiones = await orm.em.findAll(Comision)

        await orm.em.flush();

        return comisiones

    }
    
    public async findOne(item: { _id: string; }): Promise<Comision | undefined> {
        
        const comision = await orm.em.findOne(Comision, item._id)

        await orm.em.flush();
        
        return comision ?? undefined

    }
    
    public async add(item: Comision): Promise<Comision | undefined> {
        await orm.em.persist(item).flush();
        
        return item
    }
    
    public async update(item: { _id: string; }, body: _Body): Promise<Comision | undefined> {

        const comision = orm.em.getReference(Comision, item._id);
    
        if (comision){
            if (body.numero) comision.numero = body.numero
            await orm.em.flush()
        }
            
        return comision
    }
    
    public async delete(item: {_id: string; }): Promise<Comision | undefined> {
        
        const comision = orm.em.getReference(Comision, item._id);
    

        if(comision) await orm.em.remove(comision).flush();
        
        return comision
    }
}