/**
 * SDK compatibility layer for Clawdbot and OpenClaw.
 * 
 * Dynamically resolves the correct plugin-sdk at runtime.
 */

import type { ClawdbotConfig } from "clawdbot/plugin-sdk";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let resolvedSdk: any = null;

function getSdk() {
  if (resolvedSdk) return resolvedSdk;
  
  try {
    // Try OpenClaw first (when running in OpenClaw environment)
    resolvedSdk = require("openclaw/plugin-sdk");
  } catch {
    // Fall back to Clawdbot
    resolvedSdk = require("clawdbot/plugin-sdk");
  }
  return resolvedSdk;
}

// Runtime value exports - use getters to defer resolution
export function emptyPluginConfigSchema() {
  return getSdk().emptyPluginConfigSchema();
}

export function normalizeAccountId(id: string | null | undefined): string {
  return getSdk().normalizeAccountId(id);
}

export function applyAccountNameToChannelSection(opts: {
  cfg: ClawdbotConfig;
  channelKey: string;
  accountId: string;
  name?: string;
}): ClawdbotConfig {
  return getSdk().applyAccountNameToChannelSection(opts);
}

export function deleteAccountFromConfigSection(opts: {
  cfg: ClawdbotConfig;
  sectionKey: string;
  accountId: string;
  clearBaseFields?: string[];
}): ClawdbotConfig {
  return getSdk().deleteAccountFromConfigSection(opts);
}

export function setAccountEnabledInConfigSection(opts: {
  cfg: ClawdbotConfig;
  sectionKey: string;
  accountId: string;
  enabled: boolean;
  allowTopLevel?: boolean;
}): ClawdbotConfig {
  return getSdk().setAccountEnabledInConfigSection(opts);
}

export function migrateBaseNameToDefaultAccount(opts: {
  cfg: ClawdbotConfig;
  channelKey: string;
}): ClawdbotConfig {
  return getSdk().migrateBaseNameToDefaultAccount(opts);
}

export function formatPairingApproveHint(channel: string): string {
  return getSdk().formatPairingApproveHint(channel);
}

// Constants
export const DEFAULT_ACCOUNT_ID = "default";

// Get PAIRING_APPROVED_MESSAGE at runtime
export function getPairingApprovedMessage(): string {
  return getSdk().PAIRING_APPROVED_MESSAGE ?? "✅ Your access has been approved. You can now use the bot.";
}

export function addWildcardAllowFrom(existingAllowFrom: unknown[]): unknown[] {
  return getSdk().addWildcardAllowFrom(existingAllowFrom);
}
