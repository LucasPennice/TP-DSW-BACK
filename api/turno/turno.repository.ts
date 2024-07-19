import { Repostitory } from "../shared/repository.js";
import { Turno } from "./turno.entity.js";
import { orm } from "../orm.js";

type _Body = Omit<Partial<Turno>,"_id">;

export class TurnoRepository implements Repostitory<Turno>{
    
    public async findAll(): Promise<Turno[] | undefined> {
        const turnos = await orm.em.findAll(Turno)

        await orm.em.flush();

        return turnos

    }
    
    public async findOne(item: { _id: string; }): Promise<Turno | undefined> {
        
        const turno = await orm.em.findOne(Turno, item._id)

        await orm.em.flush();
        
        return turno ?? undefined

    }
    
    public async add(item: Turno): Promise<Turno | undefined> {
        await orm.em.persist(item).flush();
        
        return item
    }
    
    public async update(item: { _id: string; }, body: _Body): Promise<Turno | undefined> {

        const turno = orm.em.getReference(Turno, item._id);
    
        if (turno){
            
            if (body.nombre) turno.nombre = body.nombre
            await orm.em.flush()
        }
            
        return turno
    }
    
    public async delete(item: {_id: string; }): Promise<Turno | undefined> {
        
        const turno = orm.em.getReference(Turno, item._id);
    

        if(turno) await orm.em.remove(turno).flush();
        
        return turno
    }
}