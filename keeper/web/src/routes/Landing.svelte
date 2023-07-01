<script lang="ts">
  import { onMount } from 'svelte'
  import Logout from '../components/Logout.svelte'
  import NationalID from '../components/credentialCards/NationalID.svelte'
  import keeper from '../lib/keeper/api'
  import * as authority from '../lib/authority/api/requests'
  import StudentID from '../components/credentialCards/StudentID.svelte'

  let password = 'rawr' // TODO remove default password
  let authorityEndpoint: URL
  let wants: string

  // http://localhost:5173/landing?authority=http://localhost:8080/api/credential/student/issue&wants=NationalIDCredential&for=StudentIDCredential

  onMount(async () => {
    const urlSearchParams = new URLSearchParams(location.search)
    authorityEndpoint = new URL(urlSearchParams.get('authority'))
    wants = urlSearchParams.get('wants')
    console.log(!!authorityEndpoint, wants)
  })

  async function sendVerifiablePresentation(endpoint: URL, credentials: string[]) {
    const { did } = await keeper.getDid()

    const challengeEndpoint = new URL(endpoint.origin + '/api/challenge')
    const { challenge } = await authority.getChallenge(challengeEndpoint, did)

    // Send VerifiablePresentation to authority
    const presentation = await keeper.createVerifiablePresentation(password, credentials, challenge)
    let response = await authority.sendVerifiablePresentation(endpoint, JSON.stringify(presentation))
    console.log('presentation', presentation)

    if (Array.isArray(response.type) && response.type.includes('StudentIDCredential')) {
      await keeper.saveVerifiableCredential(password, response.type[1], response) // TODO only works for one credential atm
      // Do login with StudentIDCredential
      const presentation = await keeper.createVerifiablePresentation(password, ['StudentIDCredential'], challenge)
      response = await authority.sendVerifiablePresentation(
        new URL(endpoint.origin + '/api/auth/token/create'),
        JSON.stringify(presentation)
      )
    }

    if (response.accessToken) {
      window.open(`http://localhost:4200/login?token=${response.accessToken}`, '_self') // send token to authority frontend
    }
    authorityEndpoint = null // enforce re-render TODO find better way
  }
</script>

{#if authorityEndpoint && wants}
  <h1>Verification Request</h1>
  <b>{authorityEndpoint.host}</b> would like to verify your identity.<br />
  They request to see the following credentials of yours:<br /><br />

  <li>{wants}</li>

  <div>
    <p>Allow <b>{authorityEndpoint.host}</b> to see your credentials by typing your password:</p>
    <form style="display: flex; align-items: center; justify-content: center;">
      <input id="password" type="password" autocomplete="current-password" bind:value={password} />
      <button
        type="submit"
        on:click|preventDefault={() => {
          sendVerifiablePresentation(authorityEndpoint, [wants])
        }}
        >Allow
      </button>
    </form>
  </div>

  <div>
    Or, alternatively,
    <button on:click={() => (authorityEndpoint = null)}>Deny</button>
    <!-- ^^ enforces re-render TODO find better way ^^ -->
    the request.
  </div>
{:else}
  {#await keeper.getVerifiableCredential(password, 'NationalIDCredential') then credential}
    {#if credential}
      <NationalID {credential} />
    {/if}
  {/await}
  {#await keeper.getVerifiableCredential(password, 'StudentIDCredential') then credential}
    {#if credential}
      <StudentID {credential} />
    {/if}
  {/await}
{/if}

<Logout />
