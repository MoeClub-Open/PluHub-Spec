/** Optional identity service contracts; Kernel remains independent of authentication methods. */
export interface CaptchaOptions {
  enabled: boolean;
  /** Omitted by legacy providers; defaults to Turnstile. */
  provider?: "turnstile" | "recaptcha" | "hcaptcha" | "geetest";
  siteKey?: string;
  recaptchaVersion?: "v2" | "v3";
  recaptchaDomain?: "www.google.com" | "www.recaptcha.net";
}
export interface CaptchaVerification {
  /** Provider token, or a JSON string of GeeTest v4 getValidate() fields. */
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
  captchaProvider?: CaptchaOptions;
  /** Legacy alias, provided only when Turnstile is selected. */
  turnstile?: CaptchaOptions;
}
