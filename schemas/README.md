# Schemas <!-- omit in toc -->

- [1. Credential Schemas](#1-credential-schemas)
  - [1.1. StudentCredential](#11-studentcredential)
    - [1.1.1. StudySubject](#111-studysubject)
    - [1.1.2. StudentData](#112-studentdata)
    - [1.1.3. Address](#113-address)

# 1. Credential Schemas

## 1.1. StudentCredential

A subject of a Verifiable Credential. Represents a Student ID.

| Property            | Expected Type                       | Alias | Description                                 |
| ------------------- | ----------------------------------- | ----- | ------------------------------------------- |
| currentTerm         | [Integer]                           |       | .                                           |
| matriculationNumber | [Integer]                           |       | .                                           |
| studentData         | [`StudentData`](#112-studentdata)   |       | Personal information to identify a student. |
| studySubject        | [`StudySubject`](#111-studysubject) |       | Description of the study subject.           |

### 1.1.1. StudySubject

In principle, all properties of `Person` are allowed.
But at least the following properties are required.

| Property     | Expected Type | Alias       | Description                                                          |
| ------------ | ------------- | ----------- | -------------------------------------------------------------------- |
| degree       | [Text]        |             | .                                                                    |
| name         | [Name]        |             | .                                                                    |
| providerName | [Text]        | [legalName] | The legal name of the institution which provides this study subject. |

### 1.1.2. StudentData

| Property    | Expected Type       | Alias             | Description |
| ----------- | ------------------- | ----------------- | ----------- |
| address     | [`Address`](#113-address) |                   | .           |
| firstName   | [Text]              | [givenName]       | .           |
| middleNames | [Text]              | [additionalNames] | .           |
| familyName  | [Text]              | [familyName]      | .           |
| birthDate   | [Text]              | [birthDate]       | .           |
| photoURL    | [URL]               |                   | .           |

### 1.1.3. Address 

| Property    | Expected Type | Alias | Description |
| ----------- | ------------- | ----- | ----------- |
| apartment   | [Integer]     |       |             |
| city        | [Text]        |       |             |
| county      | [Text]        |       |             |
| country     | [Text]        |       |             |
| houseNumber | [Integer]     |       |             |
| postalCode  | [Text]        |       |             |
| street      | [Text]        |       |             |
| suffix      | [Text]        |       |             |

<!-- Link list -->

[Integer]: https://schema.org/Integer
[Name]: https://schema.org/Name
[Text]: https://schema.org/Text
[URL]: https://schema.org/URL

[additionalNames]: https://schema.org/additionalNames
[birthDate]: https://schema.org/birthDate
[familyName]: https://schema.org/familyName
[givenName]: https://schema.org/givenName
[legalName]: https://schema.org/legalName
