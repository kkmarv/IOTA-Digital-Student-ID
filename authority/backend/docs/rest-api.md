# REST API <!-- omit in toc -->

## Contents

- [1. Endpoints](#1-endpoints)
  - [1.1. POST `/api/v0/challenge`](#11-post-apiv0challenge)
  - [1.2. POST `/api/v0/student/register`](#12-post-apiv0studentregister)
  - [1.3. POST `/api/v0/student/login`](#13-post-apiv0studentlogin)

# 1. Endpoints

## 1.1. POST `/api/v0/challenge`

### 1.2.1. Request Body <!-- omit in toc -->

- Content-Type: application/json; charset=utf-8

> The request must contain the DID of the requester.

```json
{
  "id": "did:iota:dev:8dQAzVbbf6FLW9ckwyCBnPmcMGcUV9LYJoXtgQkHcNQy"
}
```

### 1.1.1. Response Body <!-- omit in toc -->

#### On success <!-- omit in toc -->

- Content-Type: text/plain; charset=utf-8
- Content-Length: 64

> The response contains a single 32 Byte hex-encoded string serving as a challenge.

```
883f0922e1add9f51862cff9f8e8c6769bf2b1acb4bf5c8ac9b03698c237733b
```

#### On Failure <!-- omit in toc -->

| Error Code | Reason                             |
| ---------- | ---------------------------------- |
| `400`      | The payload contains no DID.       |
| `422`      | The payload contains no valid DID. |

## 1.2. POST `/api/v0/student/register`

### 1.2.1. Request Body <!-- omit in toc -->

- Content-Type: application/json

> The request must contain the following (personal) information about a student and their study subject.

```json
{
  "id": "did:iota:dev:8dQAzVbbf6FLW9ckwyCBnPmcMGcUV9LYJoXtgQkHcNQy",
  "challenge": "todo",
  "challengeSignature": "todo",
  "studySubject": {
    "degree": "Bachelor of Arts",
    "name": "Gender Studies"
  },
  "studentData": {
    "firstName": "Dustin",
    "middleNames": "Walter Bruno",
    "familyName": "Henke",
    "birthDate": "09.07.2000",
    "photo": "https://thispersondoesnotexist.com/",
    "address": {
      "street": "Musterweg",
      "houseNumber": 123,
      "postalCode": 123456,
      "city": "Musterstetten",
      "county": "Bavaria",
      "country": "Germany"
    }
  }
}
```

### 1.2.2. Response Body <!-- omit in toc -->

- Content-Type: application/json

#### On success <!-- omit in toc -->

> The response is a Verifiable Credential of type `StudentCredential`.

```json
{
  "@context": "https://www.w3.org/2018/credentials/v1",
  "type": ["VerifiableCredential", "StudentCredential"],
  "credentialSubject": {
    "id": "did:iota:dev:8dQAzVbbf6FLW9ckwyCBnPmcMGcUV9LYJoXtgQkHcNQy",
    "currentTerm": 1,
    "matriculationNumber": 1668717661699,
    "providerName": "Anhalt University of Applied Sciences",
    "studentData": {
      "address": {
        "city": "Musterstetten",
        "country": "Germany",
        "county": "Bavaria",
        "houseNumber": 123,
        "postalCode": 123456,
        "street": "Musterweg"
      },
      "birthDate": "09.07.2000",
      "familyName": "Henke",
      "firstName": "Dustin",
      "middleNames": "Walter Bruno",
      "photo": "https://thispersondoesnotexist.com/"
    },
    "studySubject": {
      "degree": "Bachelor of Arts",
      "name": "Gender Studies"
    }
  },
  "issuer": "did:iota:dev:8Y12LwEq4qBY1PnveWXZeH2LiunGdgKwe9cEaevLwFgs",
  "issuanceDate": "2022-11-17T20:41:01Z",
  "expirationDate": "2023-04-01T00:00:00Z",
  "nonTransferable": true,
  "proof": {
    "type": "JcsEd25519Signature2020",
    "verificationMethod": "did:iota:dev:8Y12LwEq4qBY1PnveWXZeH2LiunGdgKwe9cEaevLwFgs#key-sign-student",
    "signatureValue": "5mMRyqqPEzRrvxuXnWtvRRwws8RjsKJ4EoXatW2bzSNFSoDr8aG8SR8Svfoqqo57pfQpz1m1shYVKxmZspomYQ44"
  }
}
```

#### On Failure <!-- omit in toc -->

| Error Code | Reason                                           |
| ---------- | ------------------------------------------------ |
| `401`      | The requester did not acquire a challenge first. |
| `422`      | The format of the credential is wrong.           |

## 1.3. POST `/api/v0/student/login`

### 1.3.1. Request Body <!-- omit in toc -->

- Content-Type: application/json

> The body must be a Verifiable Presentation containing a `StudentCredential`.

```json
{
  "@context": "https://www.w3.org/2018/credentials/v1",
  "type": "VerifiablePresentation",
  "verifiableCredential": {
    "@context": "https://www.w3.org/2018/credentials/v1",
    "type": ["VerifiableCredential", "StudentCredential"],
    "credentialSubject": {
      "id": "did:iota:dev:93CAAWQeq6GmR8NCpJTEmNmUqvTUNJADoFNhDehF1XLU",
      "currentTerm": 1,
      "matriculationNumber": 1673140194620,
      "providerName": "Anhalt University of Applied Sciences",
      "studentData": {
        "address": {
          "city": "Musterstetten",
          "country": "Germany",
          "county": "Bavaria",
          "houseNumber": 123,
          "postalCode": 123456,
          "street": "Musterweg"
        },
        "birthDate": "09.07.2000",
        "familyName": "Henker",
        "firstName": "Dustin",
        "middleNames": "Friedrich Wilfried",
        "photo": "https://thispersondoesnotexist.com/"
      },
      "studySubject": {
        "degree": "Bachelor of Arts",
        "name": "Gender Studies"
      }
    },
    "issuer": "did:iota:dev:GTLHQCCGRUbT32FigCmKBos7x6VJk1WTAQnbYPUvMwmF",
    "issuanceDate": "2023-01-08T01:09:54Z",
    "expirationDate": "2023-04-01T00:00:00Z",
    "nonTransferable": true,
    "proof": {
      "type": "JcsEd25519Signature2020",
      "verificationMethod": "did:iota:dev:GTLHQCCGRUbT32FigCmKBos7x6VJk1WTAQnbYPUvMwmF#key-sign-student",
      "signatureValue": "515w4aVstpwFGLtJPL8xf82vfggDXQhb2eHqnqgcbsTJPkRh4j2gfgjYTCeWBRhTFLCQTb6wQa9VypVWncLKGcRQ"
    }
  },
  "holder": "did:iota:dev:93CAAWQeq6GmR8NCpJTEmNmUqvTUNJADoFNhDehF1XLU",
  "proof": {
    "type": "JcsEd25519Signature2020",
    "verificationMethod": "did:iota:dev:93CAAWQeq6GmR8NCpJTEmNmUqvTUNJADoFNhDehF1XLU#sign-0",
    "signatureValue": "482JQCbrvwpzebaEGLEWUeV1uR4Lp3GPCYwBy2Cy4d99KRE14Jk9vhuNNtJvLJjaHvodAfcL1bSTpVxeoQjRhoSg",
    "expires": "2023-01-08T19:27:03Z",
    "challenge": "exampleChallenge"
  }
}
```

### 1.3.2. Response Body <!-- omit in toc -->

- Content-Type: application/json

#### On Success <!-- omit in toc -->

> The response tells wether the Presentation is valid.

```json
200 OK
```

#### On Failure <!-- omit in toc -->

| Error Code | Reason                                                                         |
| ---------- | ------------------------------------------------------------------------------ |
| `400`      | The payload is not a valid Verifiable Presentation.                            |
| `401`      | The Verifiable Presentation has an invalid signature, expired credential, etc. |
| `422`      | The Verifiable Presentation contains no valid DID.                             |
