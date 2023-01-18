# REST API <!-- omit in toc -->

## Contents
- [1. Endpoints](#1-endpoints)
  - [1.1. POST `/api/challenge`](#11-post-apichallenge)

# 1. Endpoints

## 1.1. POST `/api/challenge`

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
