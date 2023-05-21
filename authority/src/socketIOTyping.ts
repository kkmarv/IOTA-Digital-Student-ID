/** Holds properties of an authentication request received from a client. */
interface AuthResponse {
  readonly signedData: {
    readonly data: any
    readonly proof: any
  }
}

/** Holds properties of an authentication request sent to a client. */
interface AuthRequest {
  readonly challenge: string
}

/** Holds properties of a register response received from a client. */
interface HelloResponse {
  readonly did: string
}

export interface ServerToClientEvents {
  authRequest: (challenge: AuthRequest) => void
}

export interface ClientToServerEvents {
  registerClient: (data: HelloResponse | null) => void
  authRequest: (data: AuthResponse) => void
}
