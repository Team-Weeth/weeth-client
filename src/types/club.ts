export interface Club {
  id: string;
  name: string;
  code: string;
  schoolName: string;
  description: string;
  contactEmail: string;
  contactPhoneNumber: string;
  primaryContact: 'PHONE' | 'EMAIL';
  profileImageUrl: string;
  backgroundImageUrl: string;
}
