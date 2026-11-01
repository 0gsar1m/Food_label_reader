import { baseCosts, estimateCosts } from '../shared/costs';
for (const users of [100, 1000, 10000]) {
  for (const personalModel of ['opus', 'sonnet'] as const) {
    const result = estimateCosts({
      ...baseCosts,
      users,
      newProfiles: Math.round(users / 10),
      personalModel,
      hosting: users >= 10000 ? 150 : users >= 1000 ? 25 : 10,
    });
    console.info(
      JSON.stringify({
        users,
        personalModel,
        ...Object.fromEntries(
          Object.entries(result).map(([k, v]) => [k, Math.round(v * 10000) / 10000]),
        ),
      }),
    );
  }
}
