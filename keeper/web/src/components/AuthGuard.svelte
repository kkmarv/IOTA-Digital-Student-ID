<script>
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import keeper from '../lib/keeper/api'
  import { appRoutes } from '../components/Router.svelte'

  // This component causes the app to make two verify requests when the user is not logged in and visits the login page
  // The first request is made by this AuthGuard component, and the second request is made by the Login component
  // As I see it, this is only solvable by switching routing libraries
  // Should try switching to Svelte Navigator for similar API and to Svelte SPA for better performance
  // It is also missing the feature to redirect to the previous page after login (but solvable with svelte-routing) and
  // one cannot navigate to the register pager when logged out because the AuthGuard component will redirect to login
  onMount(async () => {
    if (!(await keeper.verifyAccessToken())) {
      navigate(appRoutes.login)
    }
  })
</script>

<slot />
