import { type SchemaTypeDefinition } from "sanity";
import { blockContentType } from "./blockContentType";
import { categoryType } from "./categoryType";
import { productType } from "./productType";
import { orderType } from "./orderType";
import { vehicleType } from "./vehicleType";
import { grupoType } from "./grupoType";
import { userType } from "./userType";
import { accionType } from "./accionType";
import { maintenanceType } from "./maintenanceType";
import { driverType } from "./driverType";
import { shipmentType } from "./shipmentType";
import { claimType } from "./claimType";
import { auditLogType } from "./auditLogType"; 

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType, 
    categoryType, 
    productType, 
    orderType, 
    vehicleType, 
    grupoType, 
    userType, 
    accionType, 
    maintenanceType, 
    driverType, 
    shipmentType, 
    claimType,
    auditLogType,
  ], 
};