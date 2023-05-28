export interface ServerToClientEvents {
  /** Send a challenge to the client */
  authenticateClient: (data?: { readonly challenge?: string }) => void
}

export interface ClientToServerEvents {
  /** Register a client with their DID */
  registerClient: (data?: { readonly did?: string }) => void
  /** Authenticate a client with a signed challenge */
  authenticateClient: (signedChallenge?: { readonly signedData?: { data?: any; proof?: any } }) => void
}
