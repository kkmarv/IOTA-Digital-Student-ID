import identity from '@iota/identity-wasm/node'

// TODO
// Contains information about a student's library access.
export class LibraryAccess implements identity.Subject {
  readonly id: identity.DID;
  readonly [properties: string]: unknown

  constructor(id: identity.DID) {
    this.id = id
  }
}
