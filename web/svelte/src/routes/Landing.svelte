<script lang="ts">
  import io, { Socket } from 'socket.io-client'
  import { KEEPER_API_ROUTES } from '../lib/constants'
  import { hasError } from '../lib/helper'

  let socket: Socket
  let server = 'http://localhost:3000'
  let message = ''
  let password: ''

  function sendMessage() {
    socket.emit('message', message)
  }

  async function requestDataSignature(data: any, password: string): Promise<any> {
    const response = await fetch(KEEPER_API_ROUTES.signData, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: password,
        challenge: data,
      }),
    })
    if (await hasError(response)) return null
    else return await response.json()
  }

  function setServer() {
    socket = io(server)
    socket.on('connect', () => {
      console.log('WebSocket connected')
    })

    socket.on('auth', (data) => {
      const { challenge } = data
      requestDataSignature(challenge, password).then((result) => console.log(result))
    })

    socket.on('message', (message: any) => {
      console.log(message)
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
    <input bind:value={message} type="text" placeholder="Enter a message" />
    <button on:click={() => sendMessage()}>Send</button>
  </div>
</div>
