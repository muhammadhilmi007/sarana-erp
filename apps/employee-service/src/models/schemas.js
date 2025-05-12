/**
 * Swagger Schema Definitions
 * Defines schemas for API documentation
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DocumentInput:
 *       type: object
 *       required:
 *         - documentType
 *         - documentNumber
 *         - title
 *         - issueDate
 *         - issuingAuthority
 *         - fileUrl
 *         - fileName
 *         - fileSize
 *         - fileType
 *       properties:
 *         documentType:
 *           type: string
 *           enum: [ktp, npwp, ijazah, sertifikat, sim, passport, bpjs_kesehatan, bpjs_ketenagakerjaan, bank_account, contract, performance_review, training_certificate, other]
 *         documentNumber:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         issueDate:
 *           type: string
 *           format: date
 *         expiryDate:
 *           type: string
 *           format: date
 *         issuingAuthority:
 *           type: string
 *         fileUrl:
 *           type: string
 *           format: uri
 *         fileName:
 *           type: string
 *         fileSize:
 *           type: number
 *         fileType:
 *           type: string
 *
 *     DocumentRejectInput:
 *       type: object
 *       required:
 *         - reason
 *       properties:
 *         reason:
 *           type: string
 *
 *     SkillInput:
 *       type: object
 *       required:
 *         - name
 *         - level
 *       properties:
 *         name:
 *           type: string
 *         level:
 *           type: string
 *           enum: [beginner, intermediate, advanced, expert]
 *         description:
 *           type: string
 *         yearsOfExperience:
 *           type: number
 *
 *     CertificationInput:
 *       type: object
 *       required:
 *         - name
 *         - issuer
 *         - issueDate
 *       properties:
 *         name:
 *           type: string
 *         issuer:
 *           type: string
 *         issueDate:
 *           type: string
 *           format: date
 *         expiryDate:
 *           type: string
 *           format: date
 *         credentialId:
 *           type: string
 *         credentialUrl:
 *           type: string
 *           format: uri
 *         fileUrl:
 *           type: string
 *           format: uri
 *
 *     PerformanceEvaluationInput:
 *       type: object
 *       required:
 *         - evaluationPeriod
 *         - evaluationType
 *         - evaluator
 *         - ratings
 *         - overallRating
 *         - strengths
 *         - areasForImprovement
 *         - goals
 *         - comments
 *       properties:
 *         evaluationPeriod:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *               format: date
 *             endDate:
 *               type: string
 *               format: date
 *         evaluationType:
 *           type: string
 *           enum: [annual, semi-annual, quarterly, probation, project]
 *         evaluator:
 *           type: string
 *           format: uuid
 *         ratings:
 *           type: object
 *           properties:
 *             jobKnowledge:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             workQuality:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             attendance:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             communication:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             teamwork:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             problemSolving:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             initiative:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             leadership:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *         overallRating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         strengths:
 *           type: array
 *           items:
 *             type: string
 *         areasForImprovement:
 *           type: array
 *           items:
 *             type: string
 *         goals:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               targetDate:
 *                 type: string
 *                 format: date
 *         comments:
 *           type: string
 *
 *     PerformanceEvaluationUpdateInput:
 *       type: object
 *       properties:
 *         ratings:
 *           type: object
 *           properties:
 *             jobKnowledge:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             workQuality:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             attendance:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             communication:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             teamwork:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             problemSolving:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             initiative:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             leadership:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *         overallRating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         strengths:
 *           type: array
 *           items:
 *             type: string
 *         areasForImprovement:
 *           type: array
 *           items:
 *             type: string
 *         goals:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               targetDate:
 *                 type: string
 *                 format: date
 *         comments:
 *           type: string
 *
 *     AcknowledgementInput:
 *       type: object
 *       required:
 *         - acknowledgement
 *       properties:
 *         acknowledgement:
 *           type: boolean
 *         employeeComments:
 *           type: string
 *
 *     CareerPathInput:
 *       type: object
 *       required:
 *         - targetPositions
 *         - careerGoals
 *         - timeframe
 *         - developmentAreas
 *       properties:
 *         targetPositions:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         careerGoals:
 *           type: array
 *           items:
 *             type: string
 *         timeframe:
 *           type: string
 *         developmentAreas:
 *           type: array
 *           items:
 *             type: string
 *
 *     MentorshipInput:
 *       type: object
 *       required:
 *         - mentorId
 *         - startDate
 *         - goals
 *         - meetingFrequency
 *       properties:
 *         mentorId:
 *           type: string
 *           format: uuid
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         goals:
 *           type: array
 *           items:
 *             type: string
 *         meetingFrequency:
 *           type: string
 *
 *     MentorshipStatusInput:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [active, completed, cancelled]
 *         notes:
 *           type: string
 *
 *     SuccessorInput:
 *       type: object
 *       required:
 *         - isSuccessorFor
 *         - readinessLevel
 *         - developmentPlan
 *       properties:
 *         isSuccessorFor:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         readinessLevel:
 *           type: string
 *           enum: [ready-now, ready-1-year, ready-2-years, development-needed]
 *         developmentPlan:
 *           type: string
 *
 *     TrainingInput:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - type
 *         - startDate
 *         - endDate
 *         - provider
 *         - status
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [internal, external, online, conference, workshop]
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         provider:
 *           type: string
 *         location:
 *           type: string
 *         cost:
 *           type: number
 *           minimum: 0
 *         status:
 *           type: string
 *           enum: [registered, in-progress, completed, failed, cancelled]
 *
 *     TrainingUpdateInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [internal, external, online, conference, workshop]
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         provider:
 *           type: string
 *         location:
 *           type: string
 *         cost:
 *           type: number
 *           minimum: 0
 *
 *     TrainingStatusInput:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [registered, in-progress, completed, failed, cancelled]
 *         completionDate:
 *           type: string
 *           format: date
 *         certificateUrl:
 *           type: string
 *           format: uri
 *         notes:
 *           type: string
 *
 *     ContractInput:
 *       type: object
 *       required:
 *         - contractType
 *         - startDate
 *         - position
 *         - salary
 *         - workingHours
 *         - status
 *       properties:
 *         contractType:
 *           type: string
 *           enum: [probation, fixed-term, permanent, internship]
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         position:
 *           type: string
 *         salary:
 *           type: number
 *           minimum: 0
 *         benefits:
 *           type: array
 *           items:
 *             type: string
 *         workingHours:
 *           type: object
 *           properties:
 *             hoursPerWeek:
 *               type: number
 *             daysPerWeek:
 *               type: number
 *             shiftType:
 *               type: string
 *               enum: [day, night, rotating, flexible]
 *         documentUrl:
 *           type: string
 *           format: uri
 *         status:
 *           type: string
 *           enum: [draft, active, expired, terminated]
 *
 *     ContractUpdateInput:
 *       type: object
 *       properties:
 *         contractType:
 *           type: string
 *           enum: [probation, fixed-term, permanent, internship]
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         position:
 *           type: string
 *         salary:
 *           type: number
 *           minimum: 0
 *         benefits:
 *           type: array
 *           items:
 *             type: string
 *         workingHours:
 *           type: object
 *           properties:
 *             hoursPerWeek:
 *               type: number
 *             daysPerWeek:
 *               type: number
 *             shiftType:
 *               type: string
 *               enum: [day, night, rotating, flexible]
 *         documentUrl:
 *           type: string
 *           format: uri
 *
 *     ContractStatusInput:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [draft, active, expired, terminated]
 *         reason:
 *           type: string
 *         terminationDate:
 *           type: string
 *           format: date
 */
