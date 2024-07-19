import { orm } from "../orm.js";
import { Repostitory } from "../shared/repository.js";
import { Review } from "./review.entity.js";

type _Body = Partial<Review>;

export class ReviewRepository implements Repostitory<Review>{
    
    public async findAll(): Promise<Review[] | undefined> {
        const reviews = await orm.em.findAll(Review)

        await orm.em.flush();

        return reviews

    }
    
    public async findOne(item: { _id: string; }): Promise<Review | undefined> {
        
        const review = await orm.em.findOne(Review, item._id)

        await orm.em.flush();
        
        return review ?? undefined

    }

    
    public async add(item: Review): Promise<Review | undefined> {
        await orm.em.persist(item).flush();
        
        return item
    }
    
    public async update(item: { _id: string; }, body: _Body): Promise<Review | undefined> {

        const review = orm.em.getReference(Review, item._id);
    
        if (review){
            if (body.descripcion) review.descripcion = body.descripcion
            if (body.puntuacion) review.puntuacion = body.puntuacion
            await orm.em.flush()
        }
            
        return review
    }
    
    public async delete(item: {_id: string; }): Promise<Review | undefined> {
        
        const review = orm.em.getReference(Review, item._id);
    

        if(review) await orm.em.remove(review).flush();
        
        return review
    }
}