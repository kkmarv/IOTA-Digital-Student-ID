# REST API<!-- omit in toc -->

## Contents
- [1. REST API Endpoints](#1-rest-api-endpoints)
  - [1.1. GET `/api/challenge`](#11-get-apichallenge)
    - [1.1.1. Response Body](#111-response-body)
  - [1.2. POST `/api/student/register`](#12-post-apistudentregister)
    - [1.2.1. Request Body](#121-request-body)
    - [1.2.2. Response Body](#122-response-body)
  - [1.3. POST `/api/student/login`](#13-post-apistudentlogin)
    - [1.3.1. Request Body](#131-request-body)
    - [1.3.2. Response Body](#132-response-body)

# 1. REST API Endpoints

## 1.1. GET `/api/challenge`

### 1.1.1. Response Body

- Content-Type: text/html; charset=utf-8
- Content-Length: 64
  
> The response contains a single 32 Byte hex-encoded string.
```
883f0922e1add9f51862cff9f8e8c6769bf2b1acb4bf5c8ac9b03698c237733b
```

## 1.2. POST `/api/student/register`

### 1.2.1. Request Body

- Content-Type: application/json

> The request must contain personal information about a student and their study 
> subject.

```json
{
  "student": {
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
}
```

### 1.2.2. Response Body

- Content-Type: application/json

> The response is a StudentCredential.

```json
{
  "@context": "https://www.w3.org/2018/credentials/v1",
  "type": [
    "VerifiableCredential",
    "StudentCredential"
  ],
  "credentialSubject": {
    "id": "did:iota:dev:8dQAzVbbf6FLW9ckwyCBnPmcMGcUV9LYJoXtgQkHcNQy",
    "currentTerm": 1,
    "matriculationNumber": 1668626747102,
    "providerName": "Anhalt University of Applied Sciences",
    "student": {
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
  "issuer": "did:iota:dev:Hi6fF68zfXQVQJccFAsbiqiMNUnaJVvzCy3iQNRGP84q",
  "issuanceDate": "2022-11-16T19:25:47Z",
  "expirationDate": "2023-04-01T00:00:00Z",
  "nonTransferable": true,
  "proof": {
    "type": "JcsEd25519Signature2020",
    "verificationMethod": "did:iota:dev:Hi6fF68zfXQVQJccFAsbiqiMNUnaJVvzCy3iQNRGP84q#sign-matriculation-vc",
    "signatureValue": "24srzgVrMyHLqFr76bos7vqLAV3Wh5TxcAVTvHpupNrRdBtALS9hrrRWkmS769J9mQAkW9y8P5aJQPuR8thrv8Qx",
    "created": "2022-11-16T19:25:47Z",
    "expires": "2022-11-16T19:35:47Z",
    "challenge": "todo",
    "proofPurpose": "authentication"
  }
}
```

## 1.3. POST `/api/student/login`

### 1.3.1. Request Body

- Content-Type: application/json

> The body must contain a StudentCredential.

```json
{
  "@context": "https://www.w3.org/2018/credentials/v1",
  "type": [
    "VerifiableCredential",
    "StudentCredential"
  ],
  "credentialSubject": {
    "id": "did:iota:dev:8dQAzVbbf6FLW9ckwyCBnPmcMGcUV9LYJoXtgQkHcNQy",
    "currentTerm": 1,
    "matriculationNumber": 1668626747102,
    "providerName": "Anhalt University of Applied Sciences",
    "student": {
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
  "issuer": "did:iota:dev:Hi6fF68zfXQVQJccFAsbiqiMNUnaJVvzCy3iQNRGP84q",
  "issuanceDate": "2022-11-16T19:25:47Z",
  "expirationDate": "2023-04-01T00:00:00Z",
  "nonTransferable": true,
  "proof": {
    "type": "JcsEd25519Signature2020",
    "verificationMethod": "did:iota:dev:Hi6fF68zfXQVQJccFAsbiqiMNUnaJVvzCy3iQNRGP84q#sign-matriculation-vc",
    "signatureValue": "24srzgVrMyHLqFr76bos7vqLAV3Wh5TxcAVTvHpupNrRdBtALS9hrrRWkmS769J9mQAkW9y8P5aJQPuR8thrv8Qx",
    "created": "2022-11-16T19:25:47Z",
    "expires": "2022-11-16T19:35:47Z",
    "challenge": "todo",
    "proofPurpose": "authentication"
  }
```

### 1.3.2. Response Body

- Content-Type: application/json