/**
 * DenoGenesis Meta-Documentation Framework
 *
 * This module exports types and utilities for working with the
 * meta-documentation framework. The framework itself is primarily
 * documentation-based - see README.md and docs/ for the complete guide.
 *
 * @module
 */

export const VERSION = "1.0.0";

/**
 * Unix Philosophy Principles as TypeScript types
 */
export interface UnixPrinciples {
  /** Each module should have a single, clear responsibility */
  doOneThingWell: boolean;
  /** Functions should be composable and pure where possible */
  composable: boolean;
  /** Configuration should be text-based and human-readable */
  textBased: boolean;
  /** Dependencies should be explicit, not magic */
  explicitNotMagic: boolean;
  /** Output should be minimal by default, verbose on request */
  minimalOutput: boolean;
  /** Security should be explicit with auditable permissions */
  securityFirst: boolean;
  /** Leverage existing capabilities, don't reinvent */
  leverageExisting: boolean;
}

/**
 * Architectural Decision Record structure
 */
export interface ADR {
  /** ADR identifier (e.g., "ADR-001") */
  id: string;
  /** Title of the decision */
  title: string;
  /** Status: PROPOSED, ACCEPTED, DEPRECATED, SUPERSEDED */
  status: "PROPOSED" | "ACCEPTED" | "DEPRECATED" | "SUPERSEDED";
  /** Context explaining why the decision is needed */
  context: string;
  /** The decision that was made */
  decision: string;
  /** Rationale for the decision */
  rationale: string;
  /** Alternative approaches considered */
  alternatives: string[];
  /** Positive and negative consequences */
  consequences: {
    positive: string[];
    negative: string[];
    mitigation?: string[];
  };
  /** Related patterns or ADRs */
  related: string[];
  /** Date for next review */
  reviewDate?: string;
}

/**
 * Framework compliance checklist
 */
export interface ComplianceChecklist {
  unixPhilosophy: {
    singleResponsibility: boolean;
    composable: boolean;
    textBasedConfig: boolean;
    explicitDependencies: boolean;
    minimalOutput: boolean;
  };
  security: {
    explicitPermissions: boolean;
    inputValidation: boolean;
    parameterizedQueries: boolean;
    multiTenantIsolation: boolean;
    defenseInDepth: boolean;
  };
  architecture: {
    followsHubSpoke: boolean;
    adrCreated: boolean;
    testsIncluded: boolean;
    documentationUpdated: boolean;
    performanceConsidered: boolean;
  };
}

/**
 * Check if a module follows Unix Philosophy principles
 */
export function checkUnixCompliance(
  module: Record<string, unknown>,
): Partial<UnixPrinciples> {
  // This is a placeholder - actual implementation would analyze the module
  return {
    doOneThingWell: true,
    composable: true,
    textBased: true,
    explicitNotMagic: true,
    minimalOutput: true,
    securityFirst: true,
    leverageExisting: true,
  };
}

/**
 * Validate framework compliance
 */
export function validateCompliance(
  checklist: Partial<ComplianceChecklist>,
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  // Check Unix Philosophy compliance
  if (checklist.unixPhilosophy) {
    const up = checklist.unixPhilosophy;
    if (!up.singleResponsibility) violations.push("Module lacks single responsibility");
    if (!up.composable) violations.push("Module is not composable");
    if (!up.textBasedConfig) violations.push("Configuration is not text-based");
    if (!up.explicitDependencies) violations.push("Dependencies are not explicit");
    if (!up.minimalOutput) violations.push("Output is not minimal by default");
  }

  // Check security compliance
  if (checklist.security) {
    const sec = checklist.security;
    if (!sec.explicitPermissions) violations.push("Permissions are not explicit");
    if (!sec.inputValidation) violations.push("Input validation is missing");
    if (!sec.parameterizedQueries) violations.push("Queries are not parameterized");
    if (!sec.multiTenantIsolation) violations.push("Multi-tenant isolation is missing");
    if (!sec.defenseInDepth) violations.push("Defense-in-depth not implemented");
  }

  // Check architecture compliance
  if (checklist.architecture) {
    const arch = checklist.architecture;
    if (!arch.followsHubSpoke) violations.push("Doesn't follow hub-and-spoke pattern");
    if (!arch.adrCreated) violations.push("ADR not created for architectural change");
    if (!arch.testsIncluded) violations.push("Tests not included");
    if (!arch.documentationUpdated) violations.push("Documentation not updated");
    if (!arch.performanceConsidered) violations.push("Performance not considered");
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Create a new ADR template
 */
export function createADR(
  id: string,
  title: string,
): ADR {
  return {
    id,
    title,
    status: "PROPOSED",
    context: "",
    decision: "",
    rationale: "",
    alternatives: [],
    consequences: {
      positive: [],
      negative: [],
    },
    related: [],
  };
}

/**
 * Framework information
 */
export const FRAMEWORK = {
  name: "DenoGenesis Meta-Documentation",
  version: VERSION,
  description:
    "Meta-documentation framework for building enterprise-grade applications using Unix Philosophy + Deno + AI-Augmented Development",
  repository: "https://github.com/dominguez-tech/deno-genesis-meta-docs",
  documentation: "https://jsr.io/@denogenesis/meta-docs",
  author: {
    name: "Pedro M. Dominguez",
    company: "Dominguez Tech Solutions LLC",
    location: "Oklahoma City, OK",
    email: "info@domingueztechsolutions.com",
  },
} as const;
