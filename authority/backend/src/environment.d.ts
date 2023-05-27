declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AUTHORITY_DID?: string
      AUTHORITY_SEED?: string
      AUTHORITY_NAME?: string
      AUTHORITY_WEBSITE?: string
      AUTHORITY_NETWORK?: string
      AUTHORITY_PRIMARY_NODE_URL?: string
      AUTHORITY_PROOF_EXPIRATION?: string
      START_SUMMER_SEMESTER?: string
      START_WINTER_SEMESTER?: string
    }
  }
}

export {}
