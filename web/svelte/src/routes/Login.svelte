<script lang="ts">
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { KEEPER_API_ROUTES } from '../lib/constants'
  import { verifyAccessToken, requestAccessToken } from '../lib/auth'
  import CredentialForm from '../components/CredentialForm.svelte'
  import Loading from '../components/Loading.svelte'

  // Skip login if already logged in
  let hasLoaded = false
  onMount(async () => {
    if (await verifyAccessToken()) navigate('/landing', { replace: true })
    hasLoaded = true
  })

  type tab = 'login' | 'register'

  // UI States
  export let activeTab: tab = 'login'
  let isRegistering = false

  // User Inputs
  let username = ''
  let password = ''

  function switchTab(tab: tab) {
    if (isRegistering) return
    activeTab = tab
  }

  async function register(username: string, password: string) {
    isRegistering = true
    const response = await fetch(KEEPER_API_ROUTES.registerNewUser, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
    isRegistering = false
    if (response?.ok) login(username, password)
    else console.log('Something went wrong while registering')
  }

  async function login(username: string, password: string) {
    const requestSucceeded = await requestAccessToken(username, password)
    console.log('succed')

    if (requestSucceeded) navigate('/landing')
    else console.log('Invalid Login')
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
    <CredentialForm bind:username bind:password buttonText={'Login'} submitAction={login} />
  {:else if activeTab === 'register'}
    <CredentialForm
      bind:username
      bind:password
      buttonText={'Register'}
      submitAction={register}
      submitDisabled={isRegistering}
    />
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
