<script lang="ts">
  import Image from '../Image.svelte'
  export let src: string
</script>

<div class="cropped-image">
  <Image {src} alt="A biometric picture of the cardholder." />
</div>

<style>
  .cropped-image {
    width: calc(2.1875em * 3.75);
    height: calc(2.8125em * 3.75);
    border-radius: 12px;
  }
</style>
