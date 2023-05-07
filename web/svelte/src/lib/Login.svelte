<script lang="ts">
  import CredentialForm from "./CredentialForm.svelte";

  const login = (username: string, password: string) => {
    console.log(username, password);
  };
</script>

<h1>Authenticate</h1>
<CredentialForm buttonText={"Login"} submitAction={login} />
