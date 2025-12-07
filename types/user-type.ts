// aifa-v2/types/user-type.ts

export const userType: UserType[] = [
  
   "guest",
  "architect",
  "admin",
  "editor",
  "authUser",
  "subscriber",
  "customer",
  "apiUser"
];
 

export type UserType =
   "guest"|
  "architect"|
  "admin"|
  "editor"|
  "authUser"|
  "subscriber"|
  "customer"|
  "apiUser"