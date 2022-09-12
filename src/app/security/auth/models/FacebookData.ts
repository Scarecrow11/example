export interface FBLocation {
  id: string
  name: string
}

export interface FacebookData {
  id: string
  email?: string
  birthday?: string
  location?: FBLocation
  first_name: string
  last_name: string
  gender?: string
}
