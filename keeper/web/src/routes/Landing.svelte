<script lang="ts">
  import { onMount } from 'svelte'
  import Logout from '../components/Logout.svelte'
  import NationalID from '../components/credentials/NationalID.svelte'
  import keeper from '../lib/keeper/api'
  import * as authority from '../lib/authority/api/requests'

  // ?authority=http://localhost:8080/api&credential=VerifiableStudentID

  const queryString = location.search
  const queryParams: { [key: string]: string } = {}

  onMount(async () => {
    new URLSearchParams(queryString).forEach((value, key) => {
      queryParams[key] = value
    })
    console.log(queryParams)

    if (queryParams.authority) {
      const { did } = await keeper.getDid('rawr')

      const { challenge } = await authority.getChallenge(`${queryParams.authority}/challenge`, did)
      console.log(challenge)

      const presentation = await keeper.createPresentation('rawr', ['nationalID'], challenge)
      console.log(presentation)

      const credential = await authority.getCredential(
        `${queryParams.authority}/credential/student/issue`,
        JSON.stringify(presentation)
      )
      console.log(credential)
    }
  })
</script>

<h1>Landing</h1>
{#await keeper.getCredential('nationalID') then credential}
  <NationalID {credential} />
{/await}

<Logout />
