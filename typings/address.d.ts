/* eslint-disable */

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
