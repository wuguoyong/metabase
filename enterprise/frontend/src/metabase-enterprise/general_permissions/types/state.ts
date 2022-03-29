import { State } from "metabase-types/store";
import { GeneralPermissions } from "./permissions";
import { UserWithPermissions } from "./user";

export interface GeneralPermissionsState extends State {
  currentUser: UserWithPermissions;
  generalPermissionsPlugin: {
    generalPermissions: GeneralPermissions;
    originalGeneralPermissions: GeneralPermissions;
  };
}
