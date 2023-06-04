<script>
  export let data
</script>

<div class="address-card">
  <p>{data.street} {data.houseNumber}{data.houseNumberSuffix && ` ${data.houseNumberSuffix}`}</p>
  <p>{data.city}, {data.country}, {data.postalCode}</p>
</div>

<style>
  .address-card {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
</style>
