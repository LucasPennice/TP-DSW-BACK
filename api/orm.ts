import { MongoHighlighter } from '@mikro-orm/mongo-highlighter';
import { MikroORM, MongoDriver, Options } from '@mikro-orm/mongodb'; // or any other driver package

const uri = "mongodb+srv://lucaspennice:AsrdCw0bMeHAGYUY@desarrollodesoftwareclu.zdvoysd.mongodb.net/?retryWrites=true&w=majority&appName=DesarrolloDeSoftwareCluster";

const config: Options = {
    entities: ['./dist/**/*.entity.js'],
    entitiesTs: ['./api/**/*.entity.ts'],
    dbName: 'my-db-name',
    highlighter: new MongoHighlighter(),
    clientUrl: uri,
    debug: true,
    driver: MongoDriver
  }
  
  export const orm = await MikroORM.init(config);

