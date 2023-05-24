<script lang="ts">
  export let password: string = ''
  export let username: string = ''
  export let buttonText: string
  export let onSubmit: (username: string, password: string) => void
  export let isDisabled = false
</script>

<form>
  <div>
    <label for="username">Username</label>
    <input id="username" type="text" bind:value={username} />
  </div>
  <div>
    <label for="password">Password</label>
    <input id="password" type="password" bind:value={password} />
  </div>
  <button
    type="submit"
    disabled={isDisabled}
    on:click|preventDefault={() => {
      onSubmit(username, password)
    }}
    >{buttonText}
  </button>
</form>

<style>
  label {
    width: 100px;
    display: inline-block;
  }
  form {
    display: inline-flex;
    padding-top: 10px;
    flex-flow: column;
  }
  button {
    align-self: flex-end;
    margin-top: 1em;
  }
</style>
