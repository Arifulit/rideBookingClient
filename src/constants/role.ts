export const role = {
  admin: "admin",
  rider: "rider",
  driver: "driver",
  user: "user",
} as const;

export type TRole = 'admin' | 'rider' | 'driver' | 'user';