import { z } from 'zod';
/** Public list prices in USD per million tokens; dated planning assumptions, not a supplier quote. */
export const rates = {
  vision: { input: 0.75, output: 3.75 },
  opus: { input: 4, output: 20 },
  sonnet: { input: 2, output: 10 },
};
/** All load assumptions are editable; image tokens and thinking must be included in measured usage. */
export const costInputSchema = z.object({
  users: z.number().int().min(0).max(1e8),
  scansPerUser: z.number().min(0).max(1e5),
  personalFraction: z.number().min(0).max(1),
  newProfiles: z.number().int().min(0).max(1e8),
  retries: z.number().min(0).max(3),
  visionInput: z.number().min(0),
  visionOutput: z.number().min(0),
  personalInput: z.number().min(0),
  personalOutput: z.number().min(0),
  hosting: z.number().min(0),
  subscription: z.number().min(0),
  personalModel: z.enum(['opus', 'sonnet']),
  priceWindow: z.enum(['intro2026', 'standard2027']).optional(),
});
/** Base case budgets two photo inputs inside 3000 input tokens; verify with live usage metadata. */
export const baseCosts = {
  users: 1000,
  scansPerUser: 20,
  personalFraction: 0.5,
  newProfiles: 100,
  retries: 0.15,
  visionInput: 3000,
  visionOutput: 2000,
  personalInput: 6000,
  personalOutput: 2000,
  hosting: 25,
  subscription: 19,
  personalModel: 'opus' as const,
};
/** Separates variable API spending from fixed subscriptions and infrastructure. */
export function estimateCosts(raw: z.infer<typeof costInputSchema>) {
  const x = costInputSchema.parse(raw);
  const scans = x.users * x.scansPerUser;
  const visionMultiplier = x.priceWindow === 'standard2027' ? 2 : 1;
  const vision =
    (visionMultiplier *
      (scans * (x.visionInput * rates.vision.input + x.visionOutput * rates.vision.output))) /
    1e6;
  const personal =
    ((scans * x.personalFraction + x.newProfiles) *
      (x.personalInput * rates[x.personalModel].input +
        x.personalOutput * rates[x.personalModel].output)) /
    1e6;
  const api = (vision + personal) * (1 + x.retries);
  return {
    scans,
    vision,
    personal,
    retryReserve: (vision + personal) * x.retries,
    api,
    fixed: x.hosting + x.subscription,
    total: api + x.hosting + x.subscription,
    perScan: scans ? api / scans : 0,
  };
}
