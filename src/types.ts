export interface Registration {
  id: string;
  fullName: string;
  email: string;
  emailAddress?: string;
  email_address?: string;
  Email?: string;
  EmailAddress?: string;
  Email_Address?: string;
  mail?: string;
  phoneNumber: string;
  churchName: string;
  ageRange: string; // 10-14, 15-19, 20-24, 25-29, 30 and above
  sex: string; // Male, Female
  volunteerOptions: string[]; // usher, media, welfare, singer, instrumentalist, prayer
  timestamp: string;
}
