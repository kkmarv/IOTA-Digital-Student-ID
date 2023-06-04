/* eslint-disable */

/**
 * A student ID card containing rough personal information about a student and their studies. It is issued by a university to its students.
 */
export interface StudentIDCard {
  /**
   * The student's personal information.
   */
  student: {
    /**
     * The full name of the student.
     */
    fullName: string
    /**
     * A URI that points to a picture of the student.
     */
    photoURI: string
  }
  /**
   * The student's studies information.
   */
  studies: {
    /**
     * The student's matriculation/student number.
     */
    studentID: number
    /**
     * The official name of the university.
     */
    universityName: string
    /**
     * The title of the degree the student is pursuing.
     */
    degreeTitle: 'Bachelor' | 'Master'
    /**
     * The name of the program the student is enrolled in.
     */
    fieldOfStudy: string
    /**
     * The date the student first enrolled in the program.
     */
    enrollmentDate: string
    /**
     * The current semester the student is enrolled in.
     */
    currentSemester: number
  }
}
