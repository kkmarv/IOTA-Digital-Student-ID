# Student Credential Issuance Service <!-- omit in toc -->


## Content <!-- omit in toc -->

- [1. Usage](#1-usage)
  - [1.1. Environment variables](#11-environment-variables)
- [2. Student Registration | Matriculation](#2-student-registration--matriculation)
- [3. Student Login](#3-student-login)

# 1. Usage

If you want to run your own development server, you'll need to create a `.env` file inside the `/backend` directory and fill it with your information.

Then, simply run

```shell
npm run dev
```

## 1.1. Environment variables

| Variable              | Default value     | Description                                                  |
| --------------------- | ----------------- | ------------------------------------------------------------ |
| `STRONGHOLD_PASS`     | `undefined`       | A password used to securely store the DID's secret key.      |
| `STRONGHOLD_PATH`     | `./identity.hodl` | Where the DID's secret key will be stored.                   |
| `INSTITUTION_DID`     | `undefined`       | An existing DID URL to use for your institution.             |
| `INSTITUTION_NAME`    | `undefined`       | Used to fill out the name in VCs issued by this DID.         |
| `INSTITUTION_WEBSITE` | `undefined`       | Used to fill out the homepage in VCs issued by this DID.     |
| `INSTITUTION_NETWORK` | `dev`             | The IOTA Tangle network to use.                              |
| `PRIMARY_NODE_URL`    | `undefined`       | The primary node URL used for operations on the Tangle.      |
| `NODE_ENV`            | `undefined`       | Set it to `development` to enable some debug console prints. |

# 2. Student Registration | Matriculation 

```mermaid
%%---
%%title: Student Registration | Matriculation
%%---
sequenceDiagram
    actor S as Student
    participant U as University
    participant T as Tangle

    Note over S, U: The Student has to request a <br> challenge from the University first.
    S->>+U: register(data, challenge, challengeSignature)
    U->>U: getStudentDID(data)
    U->>U: getIssuerDID(data)
    U->>+T: resolve(issuerDID, studentDID)
    break on connection error
    U-->S: 503 Service Unavailable
    end
    T-->-U: issuerPubKey, studentPubKey
    U->>U: verifyChallengeSignature(challenge, challengeSignature, studentPubKey)
    break on invalid signature
        U-->S: 401 Unauthorized
    end
    U->>U: verifySignature(data, issuerPubKey)
    break on invalid signature
        U-->S: 403 Forbidden
    end
    U->>U: createStudentCredential(data)
    U->>U: signStudentCredential(studentCredential)
    U-->-S: studentCredential
```

# 3. Student Login

```mermaid
---
title: Student Login
---
sequenceDiagram
    actor S as Student
    participant U as University

    Note over S, U: The Student has to request a <br> challenge from the University <br> first and sign it with the VP.
    S->>S: createVP(studentCredential, challenge)
    S->>+U: login(vp)
    U->>U: verifyVP(vp)
    break on invalid signature, timestamp, etc.
        U-->S: 401 Unauthorized
    end
    U-->-S: 200 OK
```
