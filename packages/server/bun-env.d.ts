declare module "bun" {
  interface Env {
    DATABASE_URL: string;
    SERV_PASSWORD_HASH: string; // base64'd argon hash. can be generated with btoa(Bun.password.hash(password))
  }
}
