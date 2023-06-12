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

<style>
  button {
    /** position the button on the top right of the screen and keep it always visible*/
    position: fixed;
    top: 0;
    right: 0;
    z-index: 1000;
    margin: 2em;
  }
</style>
