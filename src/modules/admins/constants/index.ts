export enum AdminRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  SUPER_ADMIN = 'super-admin',
}

export const ADMIN_PASSWORD_REGEXP = new RegExp(
  /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
);
