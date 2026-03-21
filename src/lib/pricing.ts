// ─── Constants ────────────────────────────────────────────────────────────────

const DIESEL_PRICE_PER_LITRE = 2.19        // CAD, current Ontario avg (pitch as dynamic)
const ETA = 0.78                            // conversion efficiency
const TAX_CREDIT_PER_LITRE = 0.18          // LCFS equivalent CAD
const PROCESSING_COST_PER_LITRE = 0.55     // filtering + treatment
const SCARCITY_BASE_LITRES = 500           // neutral supply level on platform

// ─── Types ────────────────────────────────────────────────────────────────────

export type PricingInputs = {
  volumeLitres: number
  totalPlatformLitres?: number
}

export type PricingBreakdown = {
  oilValuePerLitre: number
}

// ─── Main Pricing Function ────────────────────────────────────────────────────
// P_oil = η × P_diesel + T - C_processing + S

export function calculatePrice(inputs: PricingInputs): PricingBreakdown {
  const {
    totalPlatformLitres = SCARCITY_BASE_LITRES,
  } = inputs

  const scarcityAdjustment = ((SCARCITY_BASE_LITRES - totalPlatformLitres) / SCARCITY_BASE_LITRES) * 0.10
  const oilValuePerLitre = Math.max(
    0.10,
    ETA * DIESEL_PRICE_PER_LITRE + TAX_CREDIT_PER_LITRE - PROCESSING_COST_PER_LITRE + scarcityAdjustment
  )

  return {
    oilValuePerLitre,
  }
}

export function formatCAD(n: number) {
  return `$${n.toFixed(2)}`
}