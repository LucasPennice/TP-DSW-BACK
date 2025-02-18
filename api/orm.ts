import { MongoHighlighter } from "@mikro-orm/mongo-highlighter";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { EntityManager, EntityRepository, MikroORM, MongoDriver, Options } from "@mikro-orm/mongodb"; // or any other driver package
import "dotenv/config";
import { Area } from "./area/area.entity";
import { Cursado } from "./cursado/cursado.entity";
import { Materia } from "./materia/materia.entity";
import { Profesor } from "./profesor/profesor.entity";
import { Review } from "./review/review.entity";
import { Usuario } from "./usuario/usuario.entity";

const ormConfig: Options = {
    entities: ["./dist/**/*.entity.js"],
    entitiesTs: ["./api/**/*.entity.ts"],
    dbName: "my-db-name",
    metadataProvider: TsMorphMetadataProvider,
    highlighter: new MongoHighlighter(),
    clientUrl: process.env.MONGO_CONECTION_URI,
    debug: false,
    driver: MongoDriver,
    dynamicImportProvider: (id) => import(id),
};

export interface Services {
    orm: MikroORM;
    em: EntityManager;
    area: EntityRepository<Area>;
    cursado: EntityRepository<Cursado>;
    materia: EntityRepository<Materia>;
    profesor: EntityRepository<Profesor>;
    review: EntityRepository<Review>;
    usuario: EntityRepository<Usuario>;
}

let cache: Services;

export async function initORM(options?: Options): Promise<Services> {
    if (cache) return cache;

    const orm = await MikroORM.init<MongoDriver>({ ...ormConfig, ...options });

    // save to cache before returning
    return (cache = {
        orm,
        em: orm.em,
        area: orm.em.getRepository(Area),
        cursado: orm.em.getRepository(Cursado),
        materia: orm.em.getRepository(Materia),
        profesor: orm.em.getRepository(Profesor),
        review: orm.em.getRepository(Review),
        usuario: orm.em.getRepository(Usuario),
    });
}
