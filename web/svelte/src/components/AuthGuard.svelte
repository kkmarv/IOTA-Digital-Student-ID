<script>
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { verifyAccessToken } from '../lib/keeper/requests'
  import { appRoutes } from '../components/Router.svelte'

  onMount(async () => {
    if (!(await verifyAccessToken())) navigate(appRoutes.login)
  })
</script>

<slot />
