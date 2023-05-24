<script>
  import { appRoutes } from '../components/Router.svelte'
</script>

<div class="keeper">
  <h1 class="logo">
    <a href={appRoutes.landing}>keeper</a>
  </h1>
</div>

<style lang="scss">
  @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600&display=swap');
  .keeper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
  }
  .logo {
    background: linear-gradient(10deg, #a94dc1 0%, #535bf2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-family: 'Chakra Petch';
    float: left;
    margin: 0.5em;
    font-size: min(10vw, 50px);
    cursor: pointer;
  }
</style>
