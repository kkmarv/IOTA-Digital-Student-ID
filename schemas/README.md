This is my [site][id] located somewhere in my Markdown document.

[id]: http://example.com/whatever/


# Schemas <!-- omit in toc -->

`JSON-LD` schemas.

- [1. StudentCredential](#1-studentcredential)

## 1. StudentCredential

A subject of a Verifiable Credential. Represents a Student ID.

| Property                           | Expected Type   | Alias | Description                                 |
| ---------------------------------- | --------------- | ----- | ------------------------------------------- |
| [courseOfStudy](#11-courseofstudy) | [CourseOfStudy] |       | Description of the study subject.           |
| matriculationNumber                | [Integer]       |       | .                                           |
| currentTerm                        | [Integer]       |       | .                                           |
| [student](#12-student)             | [Student]       |       | Personal information to identify a student. |

### CourseOfStudy <!-- omit in toc -->

In principle, all properties of `Person` are allowed.
But at least the following properties are required.

| Property     | Expected Type | Alias       | Description                                                         |
| ------------ | ------------- | ----------- | ------------------------------------------------------------------- |
| provider     | [Text]        | [legalName] | The legal name of the institution which provides study subjects.    |
| degree       | [Text]        |             | .                                                                   |
| name         | [Name]        |             | .                                                                   |
| credits      | [Integer]     |             | .                                                                   |
| termsPerYear | [Integer]     |             | Possible Values are 2,3,4,... for semester, trimester and so forth. |

### Student <!-- omit in toc -->

| Property    | Expected Type | Alias             | Description |
| ----------- | ------------- | ----------------- | ----------- |
| firstName   |               | [givenName]       | .           |
| middleNames |               | [additionalNames] | .           |
| familyName  |               | [familyName]      | .           |
| birthDate   |               | [birthDate]       | .           |
| photoURL    |               | [url]             | .           |


<!-- Link list -->

[Integer]: https://schema.org/Integer
[Person]: https://schema.org/Person
[legalName]: https://schema.org/legalName
[Text]: https://schema.org/Text
[Name]: https://schema.org/Name
[givenName]: https://schema.org/givenName
[additionalNames]: https://schema.org/additionalNames
[familyName]: https://schema.org/familyName
[birthDate]: https://schema.org/birthDate
[url]: https://schema.org/url
