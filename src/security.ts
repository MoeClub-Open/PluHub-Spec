/** Optional identity service contracts; Kernel remains independent of authentication methods. */
export interface CaptchaOptions {
  enabled: boolean;
  siteKey?: string;
}
export interface CaptchaVerification {
  token: string;
  action: "login" | "register" | "email";
}
export interface MailOptions {
  enabled: boolean;
}
export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  /** Optional HTML alternative. A plain-text body is always required. */
  html?: string;
}
export interface MailReceipt {
  messageId: string;
}
export interface AuthenticationOptions {
  registrationEnabled: boolean;
  emailLoginEnabled: boolean;
  passwordResetEnabled?: boolean;
  mailEnabled: boolean;
  webauthnEnabled: boolean;
  captcha: { login?: boolean; register?: boolean; email?: boolean };
  turnstile?: CaptchaOptions;
}
