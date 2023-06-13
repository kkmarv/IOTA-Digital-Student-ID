<script context="module">
  import { Route, Router } from 'svelte-routing'
  import Landing from '../routes/Landing.svelte'
  import Login from '../routes/Login.svelte'
  import NotFound from '../routes/NotFound.svelte'
  import AuthGuard from './AuthGuard.svelte'
  import LoginRedirect from './LoginRedirect.svelte'
  import Logo from './Logo.svelte'

  export const appRoutes = {
    login: '/login',
    register: '/register',
    landing: '/landing',
  }
</script>

<Router>
  <nav>
    <Logo />
  </nav>

  <Route path={appRoutes.login}><Login activeTab="login" /></Route>
  <Route path={appRoutes.register}><Login activeTab="register" /></Route>
  <Route path={appRoutes.landing}><AuthGuard><Landing /></AuthGuard></Route>
  <Route path="/"><LoginRedirect /></Route>
  <Route path="*"><NotFound /></Route>
</Router>
