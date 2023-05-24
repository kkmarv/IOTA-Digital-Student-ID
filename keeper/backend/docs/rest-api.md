# REST API <!-- omit in toc -->

- [1. Authentication](#1-authentication)
  - [1.1. POST `/api/auth/token/create`](#11-post-apiauthtokencreate)
  - [1.2. POST `/api/auth/token/verify`](#12-post-apiauthtokenverify)
- [2. DIDs](#2-dids)
  - [2.1. PUT `/api/did/create`](#21-put-apididcreate)
  - [2.2. POST `/api/did/get`](#22-post-apididget)
- [3. Verifiable Credentials](#3-verifiable-credentials)
  - [3.1. PUT `/api/credentials/store`](#31-put-apicredentialsstore)
  - [3.2. GET `/api/credentials/list`](#32-get-apicredentialslist)
  - [3.3. GET `/api/credentials/get/:name`](#33-get-apicredentialsgetname)
- [4. Verifiable Presentations](#4-verifiable-presentations)
  - [4.1. POST `/api/presentations/create`](#41-post-apipresentationscreate)
- [5. Error Responses](#5-error-responses)
  - [5.1. Protected Routes](#51-protected-routes)

# 1. Authentication

## 1.1. POST `/api/auth/token/create`

Get yourself a JWT by providing username and password.

| Needs authentication? | `No` |
| --------------------- | ---- |

### Request Body <!-- omit in toc -->

> The request must contain:
>
> - a username
> - a password

```json
{
  "username": "heisenberg58",
  "password": "?!chemistry%Heck&Yeah420"
}
```

### Response Body <!-- omit in toc -->

#### On success <!-- omit in toc -->

> Returns a JWT containing several assertions about keeper and its user.

```json
{
  "jwt": "..."
}
```

#### On Failure <!-- omit in toc -->

| Error Code | Reason                                     |
| ---------- | ------------------------------------------ |
| `400`      | Missing username or password.              |
| `401`      | Wrong password or the user does not exist. |
| `500`      | Corrupted Stronghold storage file.         |

## 1.2. POST `/api/auth/token/verify`

Verify the validity of your JWT by validating its signature.

| Needs authentication? | `Yes` |
| --------------------- | ----- |

### Request Body <!-- omit in toc -->

> The request must contain a JWT.

```json
{
  "jwt": "..."
}
```

### Response Body <!-- omit in toc -->

#### On success <!-- omit in toc -->

```json
204 No Content
```

#### On Failure <!-- omit in toc -->

This call cannot fail once it passes authentication.

# 2. DIDs

## 2.1. PUT `/api/did/create`

Create a new user account by creating an empty DID document. The document gets published to the Tangle.

| Needs authentication? | `No` |
| --------------------- | ---- |

### Request Body <!-- omit in toc -->

> The request must contain:
>
> - a username
> - a password

```json
{
  "username": "heisenberg58",
  "password": "?!chemistry%Heck&Yeah420"
}
```

### Response Body <!-- omit in toc -->

#### On success <!-- omit in toc -->

```json
204 No Content
```

#### On Failure <!-- omit in toc -->

| Error Code | Reason                                   |
| ---------- | ---------------------------------------- |
| `400`      | Missing username or password.            |
| `409`      | The requested username is already taken. |
| `503`      | Problem while connecting to the Tangle.  |

## 2.2. POST `/api/did/get`

Get the DID URL of the current user.

| Needs authentication? | `Yes` |
| --------------------- | ----- |

### Request Body <!-- omit in toc -->

> The request must contain the current user's password.

```json
{
  "password": "?!chemistry%Heck&Yeah420"
}
```

### Response Body <!-- omit in toc -->

#### On success <!-- omit in toc -->

> Returns the DID URL which corresponds to the current user.

```json
{
  "did": "did:iota:example123"
}
```

#### On Failure <!-- omit in toc -->

| Error Code | Reason                             |
| ---------- | ---------------------------------- |
| `400`      | Missing password.                  |
| `403`      | Wrong password.                    |
| `500`      | Corrupted Stronghold storage file. |

# 3. Verifiable Credentials

## 3.1. PUT `/api/credentials/store`

Save a Verifiable Credential to keeper's local storage.

| Needs authentication? | `Yes` |
| --------------------- | ----- |

### Request Body <!-- omit in toc -->

> The request must contain:
>
> - a name for the credential which will be used to identify it later
> - the credential itself

```json
{
  "credentialName": "ExampleName",
  "verifiableCredential": {
    ...
  }
}
```

### Response Body <!-- omit in toc -->

#### On success <!-- omit in toc -->

```json
204 No Content
```

#### On Failure <!-- omit in toc -->

| Error Code | Reason                                            |
| ---------- | ------------------------------------------------- |
| `400`      | Missing credential name or Verifiable Credential. |
| `409`      | A credential with the same name already exists.   |
| `422`      | The given credential is of incorrect format.      |
| `500`      | Unknown error while saving the credential.        |

## 3.2. GET `/api/credentials/list`

List all names of Verifiable Credentials that are currently stored.

| Needs authentication? | `Yes` |
| --------------------- | ----- |

### Response Body <!-- omit in toc -->

#### On success <!-- omit in toc -->

> Returns a list of all credential names.

```json
{
  "credentials": ["..."]
}
```

#### On Failure <!-- omit in toc -->

| Error Code | Reason                                                 |
| ---------- | ------------------------------------------------------ |
| `500`      | Unknown error while retrieving one of the credentials. |

## 3.3. GET `/api/credentials/get/:name`

Retrieve a Verifiable Credential by its `name`.

| Needs authentication? | `Yes` |
| --------------------- | ----- |

### Response Body <!-- omit in toc -->

#### On success <!-- omit in toc -->

> Returns the Verifiable Credential.

```json
{
  ...
}
```

#### On Failure <!-- omit in toc -->

| Error Code | Reason                                         |
| ---------- | ---------------------------------------------- |
| `400`      | Missing credential name.                       |
| `404`      | Credential with this name does not exist.      |
| `500`      | Unknown error while retrieving the credential. |

# 4. Verifiable Presentations

## 4.1. POST `/api/presentations/create`

Create a Verifiable Presentation from one or more locally saved credentials.

| Needs authentication? | `Yes` |
| --------------------- | ----- |

### Request Body <!-- omit in toc -->

> The request must contain:
>
> - the current user's password
> - an arbitrary challenge string
> - a list of credential names which will be included in the presentation

```json
{
  "password": "?!chemistry%Heck&Yeah420",
  "challenge": "This is a challenge text.",
  "credentialName": ["..."]
}
```

### Response Body <!-- omit in toc -->

#### On success <!-- omit in toc -->

> Returns the Verifiable Presentation. Remember that Verifiable Presentations are not saved within keeper.

```json
{
  ...
}
```

#### On Failure <!-- omit in toc -->

| Error Code | Reason                                                 |
| ---------- | ------------------------------------------------------ |
| `400`      | Missing password, challenge or credential name.        |
| `404`      | Credential with this name does not exist.              |
| `500`      | Unknown error while retrieving one of the credentials. |

# 5. Error Responses

You can expect that every failing request responds with a short description explaining why.

### Response Body <!-- omit in toc -->

```json
{
  "reason": "Because it doesn't work."
}
```

## 5.1. Protected Routes

There are some additional error codes for protected routes if you fail to provide the necessary authentication.

| Error Code | Reason                        |
| ---------- | ----------------------------- |
| `400`      | Missing Authorization header. |
| `401`      | Invalid JWT signature.        |
