<script>
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing/src/history'
  import { appRoutes } from './Router.svelte'

  onMount(() => {
    navigate(appRoutes.login, { replace: true })
  })
</script>
