import { startServer } from "..";
import { initORM } from "../orm";
import { TestSeeder } from "./seeders/populateMockDB";

export async function initTestApp(port: number) {
    const testOrmConfig = {
        clientUrl: "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.8",
        dbName: "dev_db_test",
        tsNode: true,
        debug: false,
    };

    const { orm } = await initORM(testOrmConfig);

    await orm.seeder.seed(TestSeeder);

    const result = await startServer(port, orm.em);

    return { ...result, orm };
}
