export interface ServerToClientEvents {
  /** Send a challenge to the client */
  authenticateClient: (data: { readonly challenge: string }) => void
  /** Issue a credential to a client */
  createCredential: (data: { readonly credential: any }) => void
  /** Confirm the authentication of a client */
  authenticationConfirmation: (data: { readonly success?: boolean }) => void
}

export interface ClientToServerEvents {
  /** Register a client with their DID */
  registerClient: (data?: { readonly did?: string }) => void
  /** Authenticate a client with a signed challenge */
  authenticateClient: (data?: { readonly signedData?: { data?: any; proof?: any } }) => void
  /** Create a credential for a client */
  createCredential: (data?: { readonly did?: string }) => void
}
