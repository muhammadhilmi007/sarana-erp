/**
 * Swagger Schema Definitions
 * Defines the schemas for the Auth Service API documentation
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *         firstName:
 *           type: string
 *           description: The user's first name
 *         lastName:
 *           type: string
 *           description: The user's last name
 *         phoneNumber:
 *           type: string
 *           description: The user's phone number
 *         role:
 *           type: string
 *           enum: [user, admin, manager, driver, warehouse]
 *           description: The user's role
 *         isEmailVerified:
 *           type: boolean
 *           description: Whether the user's email is verified
 *         isActive:
 *           type: boolean
 *           description: Whether the user account is active
 *         isLocked:
 *           type: boolean
 *           description: Whether the user account is locked
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: The user's last login timestamp
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the user was last updated
 *
 *     Session:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the session
 *         userId:
 *           type: string
 *           description: The user ID associated with the session
 *         ipAddress:
 *           type: string
 *           description: The IP address of the client
 *         userAgent:
 *           type: string
 *           description: The user agent of the client
 *         isActive:
 *           type: boolean
 *           description: Whether the session is active
 *         lastActivity:
 *           type: string
 *           format: date-time
 *           description: The timestamp of the last activity
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the session expires
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the session was created
 *
 *     SecurityLog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the log
 *         userId:
 *           type: string
 *           description: The user ID associated with the log (if any)
 *         action:
 *           type: string
 *           enum: [LOGIN, LOGOUT, REGISTER, PASSWORD_CHANGE, PASSWORD_RESET, PASSWORD_RESET_REQUEST, EMAIL_VERIFY, ACCOUNT_LOCK, SESSION_TERMINATE, ALL_SESSIONS_TERMINATE]
 *           description: The action performed
 *         ipAddress:
 *           type: string
 *           description: The IP address of the client
 *         userAgent:
 *           type: string
 *           description: The user agent of the client
 *         status:
 *           type: string
 *           enum: [SUCCESS, FAILED]
 *           description: The status of the action
 *         details:
 *           type: object
 *           description: Additional details about the action
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the log was created
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *         password:
 *           type: string
 *           format: password
 *           description: The user's password
 *         firstName:
 *           type: string
 *           description: The user's first name
 *         lastName:
 *           type: string
 *           description: The user's last name
 *         phoneNumber:
 *           type: string
 *           description: The user's phone number
 *
 *     RegisterResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *         message:
 *           type: string
 *           description: A message describing the result
 *         data:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *               description: The user's ID
 *             email:
 *               type: string
 *               description: The user's email address
 *             firstName:
 *               type: string
 *               description: The user's first name
 *             lastName:
 *               type: string
 *               description: The user's last name
 *             role:
 *               type: string
 *               description: The user's role
 *             isEmailVerified:
 *               type: boolean
 *               description: Whether the user's email is verified
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *         password:
 *           type: string
 *           format: password
 *           description: The user's password
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *         message:
 *           type: string
 *           description: A message describing the result
 *         data:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *               description: JWT access token
 *             refreshToken:
 *               type: string
 *               description: Refresh token
 *             expiresIn:
 *               type: integer
 *               description: Token expiration time in seconds
 *             user:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   description: The user's ID
 *                 email:
 *                   type: string
 *                   description: The user's email address
 *                 firstName:
 *                   type: string
 *                   description: The user's first name
 *                 lastName:
 *                   type: string
 *                   description: The user's last name
 *                 role:
 *                   type: string
 *                   description: The user's role
 *
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: Refresh token
 *
 *     RefreshTokenResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *         message:
 *           type: string
 *           description: A message describing the result
 *         data:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *               description: New JWT access token
 *             refreshToken:
 *               type: string
 *               description: New refresh token
 *             expiresIn:
 *               type: integer
 *               description: Token expiration time in seconds
 *
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - token
 *         - password
 *       properties:
 *         token:
 *           type: string
 *           description: Password reset token
 *         password:
 *           type: string
 *           format: password
 *           description: New password
 *
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           format: password
 *           description: Current password
 *         newPassword:
 *           type: string
 *           format: password
 *           description: New password
 *
 *     ResendVerificationRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           description: The user's first name
 *         lastName:
 *           type: string
 *           description: The user's last name
 *         phoneNumber:
 *           type: string
 *           description: The user's phone number
 *
 *     ProfileResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *         data:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *               description: The user's ID
 *             email:
 *               type: string
 *               description: The user's email address
 *             firstName:
 *               type: string
 *               description: The user's first name
 *             lastName:
 *               type: string
 *               description: The user's last name
 *             phoneNumber:
 *               type: string
 *               description: The user's phone number
 *             role:
 *               type: string
 *               description: The user's role
 *             isEmailVerified:
 *               type: boolean
 *               description: Whether the user's email is verified
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: The timestamp when the user was created
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               description: The timestamp when the user was last updated
 *             lastLogin:
 *               type: string
 *               format: date-time
 *               description: The user's last login timestamp
 *
 *     SessionsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: The session ID
 *               ipAddress:
 *                 type: string
 *                 description: The IP address of the client
 *               userAgent:
 *                 type: string
 *                 description: The user agent of the client
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 description: The timestamp when the session was created
 *               lastActivity:
 *                 type: string
 *                 format: date-time
 *                 description: The timestamp of the last activity
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: The timestamp when the session expires
 *               current:
 *                 type: boolean
 *                 description: Whether this is the current session
 *
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Always false for error responses
 *         message:
 *           type: string
 *           description: Error message
 *         errorCode:
 *           type: string
 *           description: Error code
 *         details:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 description: The field with the error
 *               message:
 *                 type: string
 *                 description: Error message for the field
 *         requestId:
 *           type: string
 *           description: Request ID for tracking
 */

// This file doesn't export anything, it's just for Swagger documentation
module.exports = {};
