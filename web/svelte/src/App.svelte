<script lang="ts">
  import Login from "./lib/Login.svelte";
  import Register from "./lib/Register.svelte";

  let activeTab = "login";

  const switchTab = (tab: "login" | "register") => {
    activeTab = tab;
  };
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
  <Login />
{:else if activeTab === "register"}
  <Register />
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
