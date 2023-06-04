import type { NationalIDCard } from '../../../../../../typings'
import hasError from '../../requestValidation'

const randomUserApi = 'https://randomuser.me/api/?inc=name,nat,location,dob&noinfo'

export default async function getRandomUser(): Promise<NationalIDCard | null> {
  const response = await fetch(randomUserApi)
  if (await hasError(response)) return null

  const data = await response.json()
  const user = data.results[0]

  return {
    firstNames: [user.name.first],
    lastName: user.name.last,
    nationality: user.nat,
    dateOfBirth: new Date(user.dob.date).toLocaleDateString(),
    placeOfBirth: user.location.city,
    biometricPhotoURI: 'https://thispersondoesnotexist.com',
    address: {
      city: user.location.city,
      state: user.location.state,
      country: user.location.country,
      postalCode: user.location.postcode,
      street: user.location.street.name,
      houseNumber: user.location.street.number,
    },
  }
}
