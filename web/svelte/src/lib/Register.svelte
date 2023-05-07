<script lang="ts">
  import CredentialForm from "./CredentialForm.svelte";

  const register = (username: string, password: string) => {
    console.log(username, password);
  };
</script>

<h1>Create a new dID</h1>
<CredentialForm buttonText={"Register"} submitAction={register} />
