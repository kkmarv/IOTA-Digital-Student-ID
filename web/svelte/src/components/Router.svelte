<script lang="ts">
  import { Router, Link, Route } from 'svelte-routing';
  import { APP_ROUTES } from '../lib/constants';
  import Landing from '../routes/Landing.svelte';
  import Login from '../routes/Login.svelte';
  import Logo from './Logo.svelte';
  import NotFound from '../routes/NotFound.svelte';
  import ProtectedRoute from './ProtectedRoute.svelte';

  // Leave a small delay before routing to 404 page
  // This prevents 404 from being rendered before a route is not ready yet
  const waitFor404Delay = 50;
  let is404enabled = false;

  setTimeout(() => {
    is404enabled = true;
  }, waitFor404Delay);
</script>

<Router>
  <nav>
    <Link to={APP_ROUTES.landing}><Logo /></Link>
  </nav>

  <Route path={APP_ROUTES.login}><Login activeTab="login" /></Route>
  <Route path={APP_ROUTES.register}><Login activeTab="register" /></Route>
  <ProtectedRoute path={APP_ROUTES.landing}><Landing /></ProtectedRoute>

  {#if is404enabled}
    <Route path="*"><NotFound /></Route>
  {/if}
</Router>
