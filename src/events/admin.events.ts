import logger from "../configs/logger.config.js";
import { appEvents } from "../lib/events.js";

export const ADMIN_EVENTS = {
    ASSIGN_ROLE: "admin:assign:role",
    REVOKE_ROLE: "admin:revoke:role"
} as const;

appEvents.on(ADMIN_EVENTS.ASSIGN_ROLE, async (data) =>{
    logger.info(`Role assigned to user`, {
        role: data.role, 
        user: data.user,
        // correlationId: data.correlationId
    })
})

appEvents.on(ADMIN_EVENTS.REVOKE_ROLE, async (data) =>{
    logger.info(`Role revoked from user`, {
        role: data.role, 
        user: data.user,
        // correlationId: data.correlationId
    })
})