<script lang="ts">
  import io, { Socket } from 'socket.io-client'
  import keeper from '../lib/keeper'
  import Logout from '../components/Logout.svelte'

  let socket: Socket
  let server = 'http://localhost:3000'
  let message = ''
  let password: ''

  function sendMessage() {
    socket.emit('message', message)
  }

  function setServer() {
    socket = io(server)
    socket.on('connect', async () => {
      console.log(`WebSocket connected (${server})`)
      socket.emit('registerClient', await keeper.getDid(password))
    })

    socket.on('authRequest', (data) => {
      const { challenge } = data
      keeper.signData(challenge, password).then((signedChallenge) => {
        if (signedChallenge) {
          socket.emit('authRequest', signedChallenge)
        }
      })
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
  <Logout />
</div>
