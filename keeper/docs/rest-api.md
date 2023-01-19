# REST API <!-- omit in toc -->

- [1. DIDs](#1-dids)
  - [1.1. PUT `/api/did/create`](#11-put-apididcreate)
  - [1.2. POST `/api/did/login`](#12-post-apididlogin)
  - [1.3. POST `/api/did/get`](#13-post-apididget)
- [2. Verifiable Credentials](#2-verifiable-credentials)
  - [2.1. PUT `/api/credentials/store`](#21-put-apicredentialsstore)
  - [2.2. GET `/api/credentials/list`](#22-get-apicredentialslist)
  - [2.3. POST `/api/credentials/get`](#23-post-apicredentialsget)
- [3. Verifiable Presentations](#3-verifiable-presentations)
  - [3.1. POST `/api/presentations/create`](#31-post-apipresentationscreate)


# 1. DIDs

## 1.1. PUT `/api/did/create`

Create a DID document and publish it to the Tangle.

### Request Body <!-- omit in toc -->

> The request must contain:
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


## 1.2. POST `/api/did/login`

Get yourself a JWT with a username and a password.

### Request Body <!-- omit in toc -->

- Content-Type: `application/json`

> The request must contain:
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

> A JWT containing the username.

```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImhlaXNlbmJlcmc1OCIsImlhdCI6MTY3NDA4ODMxNCwiZXhwIjoxNjc0NjkzMTE0fQ.xqRE_2tgZzdSKVuiAm_lia0qe9Dvyd1GMDvItsVv4HM"
}
```

#### On Failure <!-- omit in toc -->

| Error Code | Reason                                     |
| ---------- | ------------------------------------------ |
| `400`      | Missing username or password.              |
| `401`      | Wrong password or the user does not exist. |
| `500`      | Corrupt Stronghold storage file.           |


## 1.3. POST `/api/did/get`

Get the DID URL of the current user.

### Request Body <!-- omit in toc -->

> The request must contain the current user's password.

```json
{
  "password": "?!chemistry%Heck&Yeah420"
}
```

### Response Body <!-- omit in toc -->

#### On success <!-- omit in toc -->

> The DID URL which corresponds to the current user.

```json
{
  "did": "did:iota:example123"
}
```

#### On Failure <!-- omit in toc -->

| Error Code | Reason                                    |
| ---------- | ----------------------------------------- |
| `400`      | Missing password or authorization header. |
| `401`      | Invalid JWT Token.                        |
| `403`      | Wrong password.                           |
| `500`      | Corrupt Stronghold storage file.          |


# 2. Verifiable Credentials

## 2.1. PUT `/api/credentials/store`

Save a Verifiable Credential to local storage.

### Request Body <!-- omit in toc -->

> The request must contain:
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

| Error Code | Reason                                                                  |
| ---------- | ----------------------------------------------------------------------- |
| `400`      | Missing credential name, Verifiable Credential or Authorization header. |
| `401`      | Invalid JWT Token.                                                      |
| `409`      | A credential with the same name already exists.                         |
| `422`      | The given credential is of incorrect format.                            |
| `500`      | Unknown error while saving the credential.                              |


## 2.2. GET `/api/credentials/list`

List all names of Verifiable Credentials that are currently stored.

### Response Body <!-- omit in toc -->

#### On success <!-- omit in toc -->

> A list of all credential names.

```json
{
  "credentials": [
    "..."
  ]
}
```

#### On Failure <!-- omit in toc -->

| Error Code | Reason                                                 |
| ---------- | ------------------------------------------------------ |
| `400`      | Missing Authorization header.                          |
| `401`      | Invalid JWT Token.                                     |
| `500`      | Unknown error while retrieving one of the credentials. |


## 2.3. POST `/api/credentials/get`

Retrieve a Verifiable Credential by its name.

### Request Body <!-- omit in toc -->

> The request must contain the name of the credential that has been used when it was stored.

```json
{
  "credentialName": "..."
}
```

### Response Body <!-- omit in toc -->

#### On success <!-- omit in toc -->

> The Verifiable Credential.

```json
{
  ...
}
```

#### On Failure <!-- omit in toc -->

| Error Code | Reason                                           |
| ---------- | ------------------------------------------------ |
| `400`      | Missing credential name or Authorization header. |
| `401`      | Invalid JWT Token.                               |
| `404`      | Credential with this name does not exist.        |
| `500`      | Unknown error while retrieving the credential.   |


# 3. Verifiable Presentations

## 3.1. POST `/api/presentations/create`

Create a Verifiable Presentation from one or more locally saved credentials.

### Request Body <!-- omit in toc -->

> The request must contain:
> - the current user's password
> - an arbitrary challenge string
> - a list of credential names which will be included in the presentation

```json
{
  "password": "?!chemistry%Heck&Yeah420",
  "challenge": "This is a challenge text.",
  "credentialName": [
    "..."
  ]
}
```

### Response Body <!-- omit in toc -->

#### On success <!-- omit in toc -->

> The Verifiable Presentation.

```json
{
  ...
}
```

#### On Failure <!-- omit in toc -->

| Error Code | Reason                                                                |
| ---------- | --------------------------------------------------------------------- |
| `400`      | Missing password, challenge, credential name or Authorization header. |
| `401`      | Invalid JWT Token.                                                    |
| `404`      | Credential with this name does not exist.                             |
| `500`      | Unknown error while retrieving one of the credentials.                |
