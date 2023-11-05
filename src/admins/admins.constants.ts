export enum AdminRoles {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  SUPER_ADMIN = 'super-admin',
}

export const PASSWORD_REGEXP = new RegExp(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/);
