<script>
  import { Router, Route } from 'svelte-routing'
  import { APP_ROUTES } from '../lib/constants'
  import Landing from '../routes/Landing.svelte'
  import Login from '../routes/Login.svelte'
  import Logo from './Logo.svelte'
  import NotFound from '../routes/NotFound.svelte'
  import AuthGuard from './AuthGuard.svelte'
</script>

<Router>
  <nav>
    <a href={APP_ROUTES.landing}><Logo /></a>
  </nav>

  <Route path={APP_ROUTES.login}><Login activeTab="login" /></Route>
  <Route path={APP_ROUTES.register}><Login activeTab="register" /></Route>
  <AuthGuard>
    <Route path={APP_ROUTES.landing}><Landing /></Route>
  </AuthGuard>
  <Route path="*"><NotFound /></Route>
</Router>
