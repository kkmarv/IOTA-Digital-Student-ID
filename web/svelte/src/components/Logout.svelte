<script>
  import { navigate } from 'svelte-routing'
  import keeper from '../lib/keeper'
  import { appRoutes } from './Router.svelte'

  async function logout() {
    const success = await keeper.logout()
    if (success) navigate(appRoutes.login, { replace: true })
    else console.log('Logout failed')
  }
</script>

<button on:click={logout}>Logout</button>
