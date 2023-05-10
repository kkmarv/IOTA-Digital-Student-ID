<script lang="ts">
  import Register from "./lib/Register.svelte";
  import CredentialForm from "./lib/CredentialForm.svelte";
  import * as identity from "@iota/identity-wasm/web/identity_wasm";

  let activeTab = "login";
  let isIotaReady = false;
  let account: identity.Account;

  let username = "";
  let password = "";

  const ACCOUNT_BUILDER = identity.init().then(
    () => {
      isIotaReady = true;
      console.log("Ready");

      return new identity.AccountBuilder({
        autosave: identity.AutoSave.every(),
        autopublish: false,
        clientConfig: { network: identity.Network.devnet() },
      });
    },
    () => {
      console.log("Fail");
    }
  );

  function switchTab(tab: "login" | "register") {
    activeTab = tab;
  }

  function register(username: string, password: string) {
    console.log(username, password);
  }
</script>

<div class="tabs">
  <div
    class="tab"
    class:selected={activeTab === "login"}
    on:click={() => switchTab("login")}
    on:keydown={() => switchTab("login")}
  >
    Login
  </div>
  <div
    class="tab"
    class:selected={activeTab === "register"}
    on:click={() => switchTab("register")}
    on:keydown={() => switchTab("register")}
  >
    Register
  </div>
</div>

{#if activeTab === "login"}
  <CredentialForm
    buttonText={"Login"}
    submitAction={register}
    {username}
    {password}
  />
{:else if activeTab === "register"}
  <CredentialForm
    buttonText={"Register"}
    submitAction={register}
    {username}
    {password}
  />
{/if}

<style>
  .tabs {
    display: flex;
    justify-content: center;
    gap: 0.5em;
  }
  .tab {
    padding: 10px;
    padding-bottom: 1px;
    cursor: pointer;
  }
  .tab.selected {
    border-bottom: 2px solid black;
  }
</style>
