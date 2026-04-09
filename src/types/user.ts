export type Role = 'LEAD' | 'ADMIN' | 'USER';
export type NullableImage = string | null;

export interface Identifiable<T = number> {
  id: T;
}

export interface Named {
  name: string;
}

export interface WithProfileImage {
  profileImageUrl: NullableImage;
}

export interface WithRole {
  role: Role;
}

export type UserSummary = Identifiable & Named & WithProfileImage & WithRole;

export type UserInfo = UserSummary;
