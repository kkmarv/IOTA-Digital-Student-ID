<script lang="ts">
  import CredentialForm from "./lib/CredentialForm.svelte";
  import * as Identity from "@iota/identity-wasm/web/identity_wasm";
  import { fetchApi } from "./lib/helper";
  import { KEEPER_API } from "./lib/constants";

  // UI States
  let activeTab = "login";
  let isIotaReady = false;
  let isRegistering = false;

  // User Inputs
  let username = "";
  let password = "";

  let account: Identity.Account;

  const ACCOUNT_BUILDER = Identity.init().then(
    () => {
      isIotaReady = true;
      console.log("Ready");

      return new Identity.AccountBuilder({
        autosave: Identity.AutoSave.every(),
        autopublish: false,
        clientConfig: { network: Identity.Network.devnet() },
      });
    },
    () => console.error("Fail")
  );

  function switchTab(tab: "login" | "register") {
    if (isRegistering) return;
    activeTab = tab;
  }

  async function register(username: string, password: string) {
    isRegistering = true;
    await fetchApi(
      "PUT",
      KEEPER_API.register,
      JSON.stringify({
        username: username,
        password: password,
      })
    );
    isRegistering = false;
  }

  async function login(username: string, password: string) {
    await fetchApi(
      "POST",
      KEEPER_API.login,
      JSON.stringify({
        username: username,
        password: password,
      })
    );
  }
</script>

<div class="keeper"><h1 class="logo">keeper</h1></div>

<div class="tabs">
  <div
    class="tab"
    class:selected={activeTab === "login"}
    class:disabled={isRegistering === true}
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
    submitAction={login}
    bind:username
    bind:password
  />
{:else if activeTab === "register"}
  <CredentialForm
    buttonText={"Register"}
    submitAction={register}
    submitDisabled={isRegistering}
    bind:username
    bind:password
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
  .tab.disabled {
    filter: contrast(25%);
  }
  .tab:hover {
    border-bottom: 2px solid #535bf2;
  }
  .keeper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
  }
  .logo {
    float: left;
    margin: 0.5em;
    font-size: min(10vw, 50px);
    cursor: pointer;
  }
</style>
