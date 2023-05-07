<script lang="ts">
  import * as identity from "@iota/identity-wasm/web/identity_wasm";

  let did: identity.DID;
  let builder;
  let account: identity.Account;

  let wantEnroll = false;
  let isEnrolled = false;
  let loggedIn = false;

  let credential;
  let challenge: string;

  const studentData = {
    address: {
      city: "Albuquerque",
      country: "USA",
      county: "New Mexico",
      houseNumber: 308,
      postalCode: 87104,
      street: "Negra Arroyo Lane",
    },
    birthDate: "07.09.1958",
    familyName: "White",
    firstName: "Walter",
    middleNames: "Hartwell",
    photo:
      "https://vignette.wikia.nocookie.net/breakingbad/images/e/e7/BB-S5B-Walt-590.jpg/revision/latest?cb=20130928055404/",
  };
  const studySubject = {
    degree: "Master of Science",
    name: "Chemistry",
  };

  identity.init().then(async () => {
    builder = new identity.AccountBuilder({
      autosave: identity.AutoSave.every(),
      autopublish: false,
      clientConfig: { network: identity.Network.devnet() },
    });
  });

  async function onCreateDID() {
    account = await builder.createIdentity();
    await account.publish();
    did = account.did();
  }

  async function onEnroll() {
    console.log({
      id: did.toString(),
    });

    const challengeRes = await fetch("http://localhost:8080/api/challenge/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: did.toString(),
      }),
    });

    challenge = await challengeRes.text();
    console.log(challenge);

    console.log({
      id: did.toString(),
      challenge: challenge,
      challengeSignature: challenge,
      studentData: studentData,
      studySubject: studySubject,
    });

    const registerRes = await fetch(
      "http://localhost:8080/api/student/register/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: did,
          challenge: challenge,
          challengeSignature: challenge,
          studentData: studentData,
          studySubject: studySubject,
        }),
      }
    );

    credential = await registerRes.json();
    console.log(credential);
  }

  async function onLogin() {
    credential = identity.Credential.fromJSON(credential);

    const vp = new identity.Presentation({
      verifiableCredential: credential,
      holder: account.did(),
    });
    console.log(vp.toJSON());

    const proof = new identity.ProofOptions({
      challenge: challenge,
      expires: identity.Timestamp.nowUTC().checkedAdd(
        identity.Duration.minutes(10)
      ),
    });

    const signedVP = await account.createSignedPresentation(
      "sign-0",
      vp,
      proof
    );

    const loginRes = await fetch("http://localhost:8080/api/student/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signedVP.toJSON()),
    });

    if (loginRes.ok) loggedIn = true;
  }
</script>

<main>
  {#if !wantEnroll}
    <button on:click={onCreateDID}>Create yourself a DID</button>

    {#if did}
      <div>Your DID: {did}</div>
      <button
        on:click={() => {
          wantEnroll = true;
        }}>Begin enrollment</button
      >
    {/if}
  {:else if !isEnrolled && !credential}
    Your personal info please:
    <div>
      About yourself
      <div>
        <label for="firstNameInput">First Name</label>
        <input id="firstNameInput" bind:value={studentData.firstName} />
      </div>
      <div>
        <label for="middleNameInput">Middle Names</label>
        <input id="middleNameInput" bind:value={studentData.middleNames} />
      </div>
      <div>
        <label for="familyNameInput">Family Name</label>
        <input id="familyNameInput" bind:value={studentData.familyName} />
      </div>
      <div>
        <label for="birthDateInput">Birth Date</label>
        <input id="birthDateInput" bind:value={studentData.birthDate} />
      </div>
      <div>
        Address
        <div>
          <label for="streetInput">Street</label>
          <input id="streetInput" bind:value={studentData.address.street} />
        </div>
        <div>
          <label for="houseNumberInput">House Number</label>
          <input
            id="houseNumberInput"
            bind:value={studentData.address.houseNumber}
          />
        </div>
        <div>
          <label for="postalCodeInput">Postal Code</label>
          <input
            id="postalCodeInput"
            bind:value={studentData.address.postalCode}
          />
        </div>
        <div>
          <label for="cityInput">City</label>
          <input id="cityInput" bind:value={studentData.address.city} />
        </div>
        <div>
          <label for="countyInput">County</label>
          <input id="countyInput" bind:value={studentData.address.county} />
        </div>
        <div>
          <label for="countryInput">Country</label>
          <input id="countryInput" bind:value={studentData.address.country} />
        </div>
      </div>
      <div>
        Now your subject
        <div>
          <label for="subjectNameInput">Subject</label>
          <input id="subjectNameInput" bind:value={studySubject.name} />
        </div>
      </div>
    </div>
    <button on:click={onEnroll}>Enroll!</button>
  {:else if credential && !loggedIn}
    Your Credential:
    <pre class="pre">
      {JSON.stringify(credential, null, 2)}
    </pre>
    <button on:click={onLogin}>Login with Credential</button>
  {:else if credential && loggedIn}
    <div>Successfully logged in!</div>
  {/if}
</main>

<style>
  input {
    width: 100px;
  }
  .pre {
    text-align: left;
  }
</style>
