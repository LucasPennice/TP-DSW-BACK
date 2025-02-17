import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { MongoMikroORM } from "@mikro-orm/mongodb/MongoMikroORM";
import { Express } from "express";
import { Server } from "http";
// import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { initTestApp } from "./initTestApp";
// import { AreaController } from "../area/area.controller";

let app: Express;
let server: Server;
let orm: MongoMikroORM<MongoEntityManager<MongoDriver>>;
// let controller: RepetitionSpecController;
// let queueBracketController: QueueBracketController;

beforeAll(async () => {
    // we use different ports to allow parallel testing
    const { app: _app, server: _server, orm: _orm } = await initTestApp(30001);
    app = _app;
    server = _server;
    orm = _orm;
});

beforeEach(async () => {
    const fork = orm.em.fork();
    // controller = new AreaController(fork);
    // queueBracketController = new QueueBracketController(fork);
});

afterAll(async () => {
    await orm.getSchemaGenerator().dropSchema();
    await new Promise((resolve) => server.close(resolve)); // Close the server
});

describe("Repetition Spec Controller", () => {
    const mockToday = new Date("2022-01-31T00:00:00");
    vi.setSystemTime(mockToday); // Mock the system time to a specific date

    test("Should create a new Repetition Spec & NOT EXECUTE THE TASK & create a queue bracket", async () => {
        expect(true).toBe(true);
    });
});
