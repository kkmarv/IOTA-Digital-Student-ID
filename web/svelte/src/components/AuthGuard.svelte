<script>
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { verifyAccessToken } from '../lib/auth'
  import { APP_ROUTES } from '../lib/constants'

  onMount(async () => {
    if (!(await verifyAccessToken())) navigate(APP_ROUTES.login)
  })
</script>

<slot />
