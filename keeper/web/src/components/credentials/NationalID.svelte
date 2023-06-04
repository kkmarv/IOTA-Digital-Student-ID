<script>
  import { countries } from '../../lib/randomuser/api/map'
  import BiometricPhoto from '../BiometricPhoto.svelte'
  export let data
</script>

<div class="id-card">
  <div>
    <p class="title">{countries[data.nationality].legalName}</p>
  </div>
  <div class="content">
    <div>
      <BiometricPhoto src={data.biometricPhotoURI} />
    </div>
    <div class="personal-info-container">
      <div class="personal-info">
        <p class="value">{data.lastName}</p>
        <p class="label">Last Name</p>
      </div>
      <div class="personal-info">
        <p class="value">{data.firstNames.join(' ')}</p>
        <p class="label">First Names</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <div class="personal-info">
          <p class="value">{data.dateOfBirth}</p>
          <p class="label">Date of Birth</p>
        </div>
        <div class="personal-info">
          <p class="value">{countries[data.nationality].nationality}</p>
          <p class="label">Nationality</p>
        </div>
      </div>
      <div class="personal-info">
        <p class="value">{data.placeOfBirth}</p>
        <p class="label">Place of Birth</p>
      </div>
      <div class="row">
        <div class="personal-info">
          <p class="value">{new Date().toLocaleDateString()}</p>
          <p class="label">Expires on</p>
        </div>
        <div class="personal-info">
          <p class="value">{new Date().toLocaleDateString()}</p>
          <p class="label">Issued on</p>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .id-card {
    margin: 20px;
    text-align: left;
    border: 1px solid #ccc;
    border-radius: 12px;
    min-width: 23em;
    // height: calc(0.35em*37.5);
    // width: calc(0.625em*37.5);
    padding: 10px;
    white-space: nowrap;

    .title {
      margin: 0;
      line-height: 2;
      font-size: 1em;
      font-weight: bold;
    }
    .content {
      display: flex;
      gap: 10px;
    }
    .personal-info-container {
      font-size: 1em;
      :last-child {
        margin-bottom: 0;
      }
      .personal-info {
        margin-bottom: 0.3em;
        .value {
          margin: 0;
          font-size: 0.95em;
          line-height: 1.4;
        }
        .label {
          margin: 0;
          font-size: 0.55em;
          line-height: 1;
        }
      }
      .row {
        display: flex;
        gap: 10px;
        * {
          margin-bottom: 0;
        }
      }
    }
  }
</style>
