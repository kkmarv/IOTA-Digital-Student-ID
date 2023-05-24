const KEEPER_API = 'http://localhost:8081/api/'

export const getDid = KEEPER_API + 'did/get'
export const signData = KEEPER_API + 'did/sign'
export const registerNewUser = KEEPER_API + 'did/create'
export const createAccessToken = KEEPER_API + 'auth/token/create'
export const verifyAccessToken = KEEPER_API + 'auth/token/verify'
export const deleteAccessToken = KEEPER_API + 'auth/token/delete'
