export type OrganizationId = string | number;
export type ActorId = string | number;

export interface TenancyModelOptions {
  organizationId: OrganizationId;
  actorId: ActorId;
}
