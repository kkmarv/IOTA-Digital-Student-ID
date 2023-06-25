<script lang="ts">
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import CredentialForm from '../components/CredentialForm.svelte'
  import Loading from '../components/Loading.svelte'
  import { appRoutes } from '../components/Router.svelte'
  import { createNationalIDCredential } from '../lib/governmentAuthority'
  import keeper from '../lib/keeper/api'
  import randomUser from '../lib/randomuser/api'

  type tab = 'login' | 'register'

  // UI States
  export let activeTab: tab = 'login'
  let isRegistering = false

  // User Inputs
  let username = ''
  let password = ''

  // Skip login if already logged in
  let hasLoaded = false
  onMount(async () => {
    if (await keeper.authenticateUser()) navigate(appRoutes.landing, { replace: true })
    hasLoaded = true
  })

  function switchTab(tab: tab) {
    if (isRegistering) return
    activeTab = tab
  }

  async function login(username: string, password: string) {
    let success = await keeper.loginUser(username, password)
    if (!success) return

    const hasNationalID = !!(await keeper.getVerifiableCredential(password, 'NationalIDCredential'))

    if (!hasNationalID) {
      // Request a national ID for the new user from the government authority
      const { did } = await keeper.getDid()
      const nationalID = await randomUser.getNationalID()
      const nationalIDCredential = await createNationalIDCredential(did, nationalID)

      // Save the user's newly created NationalIDCredential to keeper
      success = await keeper.saveVerifiableCredential(password, 'NationalIDCredential', nationalIDCredential)
    }

    if (success) navigate(appRoutes.landing, { replace: true, state: { from: appRoutes.login } })
  }

  async function register(username: string, password: string) {
    isRegistering = true
    const success = await keeper.registerUser(username, password)
    isRegistering = false
    if (success) login(username, password)
  }
</script>

{#if !hasLoaded}
  <Loading />
{:else}
  <div class="tabs">
    <div
      class="tab"
      class:selected={activeTab === 'login'}
      class:disabled={isRegistering === true}
      on:click={() => switchTab('login')}
      on:keydown={() => switchTab('login')}
    >
      Login
    </div>
    <div
      class="tab"
      class:selected={activeTab === 'register'}
      on:click={() => switchTab('register')}
      on:keydown={() => switchTab('register')}
    >
      Register
    </div>
  </div>

  {#if activeTab === 'login'}
    <CredentialForm bind:username bind:password buttonText="Login" onSubmit={login} />
  {:else if activeTab === 'register'}
    <CredentialForm bind:username bind:password buttonText="Register" onSubmit={register} isDisabled={isRegistering} />
  {/if}
{/if}

<style lang="scss">
  .tabs {
    display: flex;
    justify-content: center;
    gap: 0.5em;
    .tab {
      padding: 10px;
      padding-bottom: 1px;
      cursor: pointer;
      &.selected {
        border-bottom: 2px solid #535bf2;
      }
      &.disabled {
        filter: contrast(25%);
      }
      &:hover {
        border-bottom: 2px solid #a94dc1;
      }
    }
  }
</style>
