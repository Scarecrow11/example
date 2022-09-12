import { GenericEntity } from '../generic/model/GenericEntity'
export interface Storage {
  save(
    stream: NodeJS.WritableStream,
    userUID: string,
    entity?: string,
    isPublic?: boolean,
  ): Promise<GenericEntity>

  get<T extends GenericEntity>(uid: string, ownerUID?: string): Promise<T>
}
