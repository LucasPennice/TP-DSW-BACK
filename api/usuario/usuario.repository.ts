import { Repostitory } from "../shared/repository.js";
import { orm } from "../orm.js";
import { Usuario } from "./usuario.entity.js";

type _Body = Partial<Usuario>

export class UsuarioRepository implements Repostitory<Usuario>{
    
    public async findAll(): Promise<Usuario[] | undefined> {
        const usuarios = await orm.em.findAll(Usuario)

        await orm.em.flush();

        return usuarios

    }
    
    public async findOne(item: { _id: string; }): Promise<Usuario | undefined> {
        
        const usuario = await orm.em.findOne(Usuario, item._id)

        await orm.em.flush();
        
        return usuario ?? undefined

    }
    
    public async add(item: Usuario): Promise<Usuario | undefined> {
        await orm.em.persist(item).flush();
        
        return item
    }
    
    public async update(item: { _id: string; }, body: _Body): Promise<Usuario | undefined> {

        const usuario = orm.em.getReference(Usuario, item._id);
    
        if (usuario){
            
            if (body.nombre) usuario.nombre = body.nombre
            if (body.legajo) usuario.legajo = body.legajo
            await orm.em.flush()
        }
            
        return usuario
    }
    
    public async delete(item: {_id: string; }): Promise<Usuario | undefined> {
        
        const usuario = orm.em.getReference(Usuario, item._id);
    

        if(usuario) await orm.em.remove(usuario).flush();
        
        return usuario
    }
}