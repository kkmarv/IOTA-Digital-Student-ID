const keeperAPI = 'http://localhost:8081/api'

export const getDid = keeperAPI + '/did/get'
export const signData = keeperAPI + '/did/sign'
export const registerNewUser = keeperAPI + '/did/create'

export const createAccessToken = keeperAPI + '/auth/token/create'
export const verifyAccessToken = keeperAPI + '/auth/token/verify'
export const deleteAccessToken = keeperAPI + '/auth/token/delete'

export const getVerifiableCredential = keeperAPI + '/credential/get'
export const storeVerifiableCredential = keeperAPI + '/credential/store'