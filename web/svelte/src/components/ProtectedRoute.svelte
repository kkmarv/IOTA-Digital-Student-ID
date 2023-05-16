<script lang="ts">
  import { Route } from 'svelte-routing';
  import { verifyAccessToken } from '../lib/auth';
  import AccessDenied from './AccessDenied.svelte';

  export let path: string;
</script>

{#await verifyAccessToken() then hasAccess}
  {#if hasAccess}
    <Route {path}><slot /></Route>
  {:else}
    <Route {path}><AccessDenied /></Route>
  {/if}
{/await}
