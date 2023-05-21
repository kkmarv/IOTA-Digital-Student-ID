<script>
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import keeper from '../lib/keeper'
  import { appRoutes } from '../components/Router.svelte'

  onMount(async () => {
    if (!(await keeper.verifyAccessToken())) {
      navigate(appRoutes.login)
    }
  })
</script>

<slot />
