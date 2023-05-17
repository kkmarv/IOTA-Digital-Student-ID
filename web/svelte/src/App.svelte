<script lang="ts">
  import * as Identity from '@iota/identity-wasm/web/identity_wasm'
  import Router from './components/Router.svelte'

  // UI States
  let isIotaReady = false

  let account: Identity.Account

  const ACCOUNT_BUILDER = Identity.init().then(
    () => {
      isIotaReady = true
      console.log('IOTA Identity Loaded')

      return new Identity.AccountBuilder({
        autosave: Identity.AutoSave.every(),
        autopublish: false,
        clientConfig: { network: Identity.Network.devnet() },
      })
    },
    () => console.error('Failed to load IOTA Identity')
  )
</script>

<Router />
