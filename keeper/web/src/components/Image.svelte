<script lang="ts">
  import { onMount } from 'svelte'

  export let src: string
  export let alt = ''

  let loaded = false
  let failed = false
  let loading = false

  onMount(() => {
    const image = new Image()
    image.src = src
    loading = true

    image.onload = () => {
      loading = false
      loaded = true
    }
    image.onerror = () => {
      loading = false
      failed = true
    }
  })
</script>

{#if loaded}
  <img class="loaded" {src} {alt} />
{:else if failed}
  <img class="failed" src="https://icon-library.com/images/not-found-icon/not-found-icon-20.jpg" alt="Not Found" />
{:else if loading}
  <img class="loading" src="https://c.tenor.com/On7kvXhzml4AAAAi/loading-gif.gif" alt="Loading..." />
{/if}

<style>
  img {
    width: 100%;
    height: 100%;
    border-radius: 12px;
  }
  .loaded {
    object-fit: cover;
  }
  .failed,
  .loading {
    object-fit: contain;
  }
</style>
