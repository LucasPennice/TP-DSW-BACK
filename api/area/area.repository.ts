import { Repostitory } from "../shared/repository.js";
import { Area } from "./area.entity.js";
import { orm } from "../orm.js";

type _Body = Omit<Partial<Area>,"_id">;

export class AreaRepository implements Repostitory<Area>{
    
    public async findAll(): Promise<Area[] | undefined> {
        const areas = await orm.em.findAll(Area)

        await orm.em.flush();

        return areas

    }
    
    public async findOne(item: { _id: string; }): Promise<Area | undefined> {
        
        const area = await orm.em.findOne(Area, item._id)

        await orm.em.flush();
        
        return area ?? undefined

    }
    
    public async add(item: Area): Promise<Area | undefined> {
        await orm.em.persist(item).flush();
        
        return item
    }
    
    public async update(item: { _id: string; }, body: _Body): Promise<Area | undefined> {

        const area = orm.em.getReference(Area, item._id);
    
        if (area){
            if (body.nombre) area.nombre = body.nombre
            await orm.em.flush()
        }
            
        return area
    }
    
    public async delete(item: {_id: string; }): Promise<Area | undefined> {
        
        const area = orm.em.getReference(Area, item._id);
    

        if(area) await orm.em.remove(area).flush();
        
        return area
    }
}