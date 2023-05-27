import { DID, Subject } from '@iota/identity-wasm/node'

// TODO
// Contains information about a student's library access.
export class LibraryAccess implements Subject {
  readonly id: DID;
  readonly [properties: string]: unknown

  constructor(id: DID) {
    this.id = id
  }
}
