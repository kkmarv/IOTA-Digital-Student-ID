<script>
  import randomUser from '../../lib/randomuser/api'
  import BiometricPhoto from './BiometricPhoto.svelte'
  export let credential
  const { credentialSubject, issuanceDate, expirationDate } = credential
</script>

<div class="id-card">
  <div style="display: flex; align-items: center;;">
    <p class="title">{randomUser.countries[credentialSubject.nationality].legalName}</p>
    <img
      style="width: 30px; height:20px; margin-left: auto; margin-right: 0.5em"
      src={randomUser.countries[credentialSubject.nationality].flag}
      alt="country flag"
    />
  </div>
  <div class="content">
    <div>
      <BiometricPhoto src={credentialSubject.biometricPhotoURI} />
    </div>
    <div class="personal-info-container">
      <div class="personal-info">
        <p class="value">{credentialSubject.lastName}</p>
        <p class="label">Last Name</p>
      </div>
      <div class="personal-info">
        <p class="value">{credentialSubject.firstNames.join(' ')}</p>
        <p class="label">First Names</p>
      </div>
      <div class="row">
        <div class="personal-info">
          <p class="value">{credentialSubject.dateOfBirth}</p>
          <p class="label">Date of Birth</p>
        </div>
        <div class="personal-info">
          <p class="value">{randomUser.countries[credentialSubject.nationality].nationality}</p>
          <p class="label">Nationality</p>
        </div>
      </div>
      <div class="personal-info">
        <p class="value">{credentialSubject.placeOfBirth}</p>
        <p class="label">Place of Birth</p>
      </div>
      <div class="row">
        <div class="personal-info">
          <p class="value">{new Date(issuanceDate).toLocaleDateString()}</p>
          <p class="label">Issued on</p>
        </div>
        <div class="personal-info">
          <p class="value">{new Date(expirationDate).toLocaleDateString()}</p>
          <p class="label">Expires on</p>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .id-card {
    margin: 20px;
    text-align: left;
    border: 1px solid #1a1a1a;
    border-radius: 12px;
    min-width: 23em;
    background: #27283c;

    // height: calc(0.35em*37.5);
    // width: calc(0.625em*37.5);
    padding: 10px;
    white-space: nowrap;

    .title {
      margin: 0;
      line-height: 2;
      font-size: 1.2em;
      font-weight: bold;
    }
    .content {
      display: flex;
      gap: 10px;
    }
    .personal-info-container {
      font-size: 1.1em;
      :last-child {
        margin-bottom: 0;
      }
      .personal-info {
        margin-bottom: 0.3em;
        .value {
          margin: 0;
          font-size: 0.95em;
          line-height: 1.4;
          font-weight: 500;
        }
        .label {
          margin: 0;
          color: darkgray;
          font-size: 0.6em;
          line-height: 1;
        }
      }
      .row {
        display: flex;
        gap: 10px;
        * {
          margin-bottom: 1;
        }
      }
    }
  }
</style>
