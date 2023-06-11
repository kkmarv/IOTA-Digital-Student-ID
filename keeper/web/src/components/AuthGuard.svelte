<script>
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import keeper from '../lib/keeper/api'
  import { appRoutes } from '../components/Router.svelte'

  let authenticated = false

  onMount(async () => {
    if (!(await keeper.authenticateUser())) navigate(appRoutes.login)
    else authenticated = true
  })
</script>

{#if authenticated}
  <slot />
{/if}
