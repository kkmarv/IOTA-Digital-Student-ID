<script>
  import BiometricPhoto from './BiometricPhoto.svelte'
  export let credential
  const { credentialSubject, issuanceDate, expirationDate } = credential
</script>

<div class="id-card">
  <div>
    <p class="title">{credentialSubject.studies.universityName}</p>
  </div>
  <div class="content">
    <div>
      <BiometricPhoto src={credentialSubject.student.photoURI} />
    </div>
    <div class="personal-info-container">
      <div class="personal-info">
        <p class="value">{credentialSubject.student.fullName}</p>
        <p class="label">Student Name</p>
      </div>
      <div class="personal-info">
        <p class="value">{credentialSubject.studies.studentID}</p>
        <p class="label">Student ID</p>
      </div>
      <div class="row">
        <div class="personal-info">
          <p class="value">{credentialSubject.studies.fieldOfStudy}</p>
          <p class="label">Field of Study</p>
        </div>
        <div class="personal-info">
          <p class="value">{credentialSubject.studies.degreeTitle}</p>
          <p class="label">Degree</p>
        </div>
      </div>
      <div class="row">
        <div class="personal-info">
          <p class="value">{new Date(credentialSubject.studies.enrollmentDate).toLocaleDateString()}</p>
          <p class="label">Enrolled on</p>
        </div>
        <div class="personal-info">
          <p class="value">{credentialSubject.studies.currentSemester}</p>
          <p class="label">Current Semester</p>
        </div>
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
    background: linear-gradient(45deg, #27283c 25%, #8f292a 75%);
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
