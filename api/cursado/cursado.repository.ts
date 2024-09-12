// import { Repostitory } from "../shared/repository.js";
// import { orm } from "../orm.js";
// import { Cursado } from "./cursado.entity.js";


// type _Body = Omit<Partial<Cursado>,"_id">;

// export class CursadoRepository implements Repostitory<Cursado>{
    
//     public async findAll(): Promise<Cursado[] | undefined> {
//         const cursados = await orm.em.findAll(Cursado, {
//             populate: ['*'],
//           })

//         await orm.em.flush();

//         return cursados

//     }
    
//     public async findOne(item: { _id: string; }): Promise<Cursado | undefined> {
        
//         const cursado = await orm.em.findOne(Cursado, item._id, {
//             populate: ['*'],
//           })

//         await orm.em.flush();
        
//         return cursado ?? undefined

//     }
    
//     public async add(item: Cursado): Promise<Cursado | undefined> {

//         await orm.em.persist(item).flush();
//         return item
//     }
    
//     public async update(item: { _id: string; }, body: _Body): Promise<Cursado | undefined> {

//         const cursado = orm.em.getReference(Cursado, item._id);
    
//         if (cursado){
//             if (body.diaCursado) cursado.diaCursado = body.diaCursado
//             if (body.horaCursado) cursado.horaCursado = body.horaCursado
//             if (body.comision) cursado.comision = body.comision
//             if (body.turno) cursado.turno = body.turno
//             if (body.año) cursado.año = body.año
//             if(body.materia) cursado.materia = body.materia
//             if(body.profesor) cursado.profesor = body.profesor
//             await orm.em.flush()
//         }
            
//         return cursado
//     }
    
//     public async delete(item: {_id: string; }): Promise<Cursado | undefined> {
        
//         const cursado = orm.em.getReference(Cursado, item._id);
    

//         if(cursado) await orm.em.remove(cursado).flush();
        
//         return cursado
//     }

    
// }