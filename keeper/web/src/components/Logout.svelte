<script>
  import { navigate } from 'svelte-routing'
  import keeper from '../lib/keeper/api'
  import { appRoutes } from './Router.svelte'

  async function logout() {
    await keeper.logout()
    navigate(appRoutes.login, { replace: true })
  }
</script>

<button on:click={logout}>Logout</button>
