export enum UserSystemStatus {
  SUSPENDED = 'SUSPENDED', // after moderation rejection or as a temporary lesser ban
  BANNED = 'BANNED', // permanent ban without possibility to sign in
  REJECTED = 'REJECTED', // when moderator rejected user account
  LIMITED = 'LIMITED', // can write comments
  ACTIVE = 'ACTIVE', // can write comments, vote, propose answers, create polls
}
