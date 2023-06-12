<script lang="ts">
  import { onMount } from 'svelte'
  import Logout from '../components/Logout.svelte'
  import NationalID from '../components/credentials/NationalID.svelte'
  import keeper from '../lib/keeper/api'
  import * as identity from '@iota/identity-wasm/web/identity_wasm'

  onMount(async () => {
    const presentation = await keeper.createPresentation('rawr', ['nationalID'], 'challenge')
    console.log(presentation)
  })
</script>

<h1>Landing</h1>
{#await keeper.getCredential('nationalID') then credential}
  <NationalID {credential} />
{/await}

<Logout />
