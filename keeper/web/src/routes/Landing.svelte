<script lang="ts">
  import io, { Socket } from 'socket.io-client'
  import Logout from '../components/Logout.svelte'
  import NationalID from '../components/credentials/NationalID.svelte'
  import keeper from '../lib/keeper/api'
  import randomUser from '../lib/randomuser/api/'

  let socket: Socket
  let server = 'http://localhost:3000'
  let password = ''
  let hasRegistered = false

  function setServer() {
    socket = io(server)
    socket.on('connect', async () => {
      console.log(`WebSocket connected (${server})`)
      socket.emit('registerClient', await keeper.getDid(password))
    })

    socket.on('authenticateClient', (data) => {
      const { challenge } = data
      keeper.signData(challenge, password).then((signedChallenge) => {
        if (signedChallenge) {
          socket.emit('authenticateClient', signedChallenge)
        }
      })
    })

    socket.on('authenticationConfirmation', (data) => {
      const { success } = data
      if (success) hasRegistered = true
    })

    socket.on('createCredential', async (data) => {
      console.log('createCredential', data)
    })

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })
  }
</script>

<h1>Landing</h1>
<div style="display: flex; flex-flow:column">
  <div>
    Password:
    <input bind:value={password} type="password" />
  </div>
  <div>
    <input bind:value={server} type="text" placeholder="Enter a URL" />
    <button on:click={() => setServer()}>Connect</button>
  </div>
  <div>
    <button disabled={!hasRegistered} on:click={() => socket.emit('createCredential')}>Get Credential</button>
  </div>
  <Logout />
</div>
{#await randomUser.getNationalID() then data}
  <NationalID {data} />
{/await}
