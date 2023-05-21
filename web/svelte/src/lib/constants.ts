const KEEPER_API = 'http://localhost:8081/api/'

export const KEEPER_API_ROUTES = {
  signData: KEEPER_API + 'did/sign',
  registerNewUser: KEEPER_API + 'did/create',
  createAccessToken: KEEPER_API + 'auth/token/create',
  verifyAccessToken: KEEPER_API + 'auth/token/verify',
}

export const APP_ROUTES = {
  login: '/login',
  register: '/register',
  landing: '/landing',
}
