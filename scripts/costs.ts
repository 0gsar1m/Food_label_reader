import { baseCosts, economyCosts, estimateCosts } from '../shared/costs';
for (const users of [100, 1000, 10000]) {
  for (const personalFraction of [0, 0.5]) {
    const result = estimateCosts({
      ...economyCosts,
      users,
      personalFraction,
      newProfiles: personalFraction ? Math.round(users / 10) : 0,
      hosting: users >= 10000 ? 150 : users >= 1000 ? 25 : 10,
    });
    console.info(
      JSON.stringify({
        users,
        personalFraction,
        ...Object.fromEntries(
          Object.entries(result).map(([k, v]) => [k, Math.round(v * 10000) / 10000]),
        ),
      }),
    );
  }
}

for (const scans of [2, 3, 20000]) {
  const result = estimateCosts({
    ...baseCosts,
    users: 1,
    scansPerUser: scans,
    personalFraction: 1,
    newProfiles: 0,
    retries: 0,
    hosting: 0,
    subscription: 0,
    personalModel: 'sonnet',
  });
  console.info(JSON.stringify({ mode: 'Vision + Sonnet demo', scans, api: result.api }));
}
