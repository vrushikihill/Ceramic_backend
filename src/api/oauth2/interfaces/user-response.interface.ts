export interface IMicrosoftUser {
  readonly businessPhones: string[];
  readonly displayName: string;
  readonly givenName: string;
  readonly jobTitle: string;
  readonly mail: string;
  readonly mobilePhone: string;
  readonly officeLocation: string;
  readonly preferredLanguage: string;
  readonly surname: string;
  readonly userPrincipalName: string;
  readonly id: string;
}

export interface IGoogleUser {
  readonly sub: string;
  readonly name: string;
  readonly given_name: string;
  readonly family_name: string;
  readonly picture: string;
  readonly email: string;
  readonly email_verified: boolean;
  readonly locale: string;
  readonly hd: string;
}
