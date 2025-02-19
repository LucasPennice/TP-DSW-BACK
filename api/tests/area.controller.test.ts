import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { MongoMikroORM } from "@mikro-orm/mongodb/MongoMikroORM";
import { Express } from "express";
import { Server } from "http";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { initTestApp } from "./initTestApp";
import { AreaController } from "../area/area.controller";
import { Area } from "../area/area.entity";

let app: Express;
let server: Server;
let orm: MongoMikroORM<MongoEntityManager<MongoDriver>>;
let controller: AreaController;

beforeAll(async () => {
    // we use different ports to allow parallel testing
    const { app: _app, server: _server, orm: _orm } = await initTestApp(30001);
    app = _app;
    server = _server;
    orm = _orm;
});

beforeEach(async () => {
    const fork = orm.em.fork();
    controller = new AreaController(fork);
});

afterAll(async () => {
    await orm.getSchemaGenerator().dropSchema();
    await new Promise((resolve) => server.close(resolve)); // Close the server
});

describe("Area Controller", () => {
    const mockToday = new Date("2022-01-31T00:00:00");
    vi.setSystemTime(mockToday); // Mock the system time to a specific date

    test("Should Create a new Area", async () => {
        const newArea = new Area("Ciencias No Exactas!");
        const res = await controller.add(newArea);

        expect(res.success).toBe(true);
        expect(res.data).toMatchObject(newArea);
    });

    test("Should Find the Created Area", async () => {
        const { data: foundAreas } = await controller.findAll();

        expect(foundAreas![0].nombre).toBe("Ciencias No Exactas!");
    });

    test("Should Edit the Created Area's name to Exactas", async () => {
        const { data: foundAreas } = await controller.findAll();

        const area = foundAreas![0];
        area.nombre = "Exactas";

        const res = await controller.modify(area, area._id);

        expect(res.success).toBe(true);
        expect(res.data).toMatchObject(area);
    });

    test("Should Delete the Created Area through the endpoint", async () => {
        const { data: foundAreas } = await controller.findAll();

        const areaId = foundAreas![0]._id;

        // hacer una ruta que no tenga ensure auth

        const response = await request(app).delete(`/api/area/${areaId}`).expect(204); // Expecting a 204 No Content response

        expect(response.status).toBe(204);
    });
});
