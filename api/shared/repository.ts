export interface Repostitory<T> {
    findAll(): Promise<T[] | undefined>
    findOne(item: {_id: string}): Promise<T | undefined>
    add(item: T): Promise<T | undefined>
    update(item: {_id: string}, body: T): Promise<T | undefined>
    delete(item: {_id: string}): Promise<T | undefined>

}