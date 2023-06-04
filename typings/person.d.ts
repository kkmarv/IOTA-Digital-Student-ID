/* eslint-disable */

/**
 * A national ID card is a government-issued document used for personal identification.
 */
export interface NationalIDCard {
  /**
   * The first names of the cardholder.
   */
  firstNames: string[]
  /**
   * The full name of the cardholder.
   */
  lastName: string
  /**
   * The country or nation to which the cardholder is considered a citizen.
   */
  nationality: string
  /**
   * The date on which the cardholder was born.
   */
  dateOfBirth: string
  /**
   * The city where the cardholder was born.
   */
  placeOfBirth: string
  /**
   * A URI that points to a biometric picture of the cardholder.
   */
  biometricPhotoURI: string
  address: Address
}
/**
 * An address
 */
export interface Address {
  /**
   * The apartment number of the address.
   */
  apartment?: number
  /**
   * The city where the address is located.
   */
  city: string
  /**
   * The state where the address is located.
   */
  state?: string
  /**
   * The country where the address is located.
   */
  country: string
  /**
   * The postal code of the address.
   */
  postalCode: string
  /**
   * The street where the address is located.
   */
  street: string
  /**
   * The house number of the address.
   */
  houseNumber: number
  /**
   * Some addresses have a suffix to the house number such as a letter or a fraction.
   */
  houseNumberSuffix?: string
}
