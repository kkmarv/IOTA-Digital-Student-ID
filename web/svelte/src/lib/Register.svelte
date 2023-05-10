<script lang="ts">
  import CredentialForm from "./CredentialForm.svelte";


</script>

<h1>Create a new dID</h1>
<CredentialForm
  username={""}
  password={""}
  buttonText={"Register"}
  submitAction={register}
/>
