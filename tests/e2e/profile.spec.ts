import { test, expect, type Page } from '@playwright/test';
import { demoAnalysis } from '../../src/data/demo';
import { personalEvidence } from '../../server/personal';
import { emptyProfile } from '../../shared/profile';
async function start(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const guest = page.getByRole('button', { name: 'Hesapsız dene' });
  const already = page.getByRole('button', { name: 'Şimdilik geç' });
  await Promise.race([
    guest.waitFor(),
    already.waitFor(),
    page.getByRole('button', { name: 'Etiketi tara', exact: true }).waitFor(),
  ]);
  if (await guest.isVisible()) await guest.click();
  await expect(page.getByRole('button', { name: 'Şimdilik geç' })).toBeVisible();
}
async function next(page: Page) {
  await page.getByRole('button', { name: 'Devam et', exact: true }).click();
}
test('detailed onboarding, encrypted persistence, portion scaling and diary CRUD', async ({
  page,
}) => {
  let localCloudCalls = 0;
  await page.route('**/api/personalize', (route) => {
    localCloudCalls++;
    return route.abort();
  });
  await start(page);
  await page.getByRole('checkbox', { name: 'Kilo yönetimi', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Protein takibi', exact: true }).click();
  await page.screenshot({ path: 'docs/screenshots/onboarding-goals.png' });
  await next(page);
  await page.getByRole('checkbox', { name: 'Şişkinlik', exact: true }).click();
  await next(page);
  await page
    .getByRole('textbox', { name: 'Paylaşmak istediğin sağlık durumu veya hassasiyet' })
    .fill('Tanı konmamış şişkinlik');
  await page.getByRole('checkbox', { name: 'Kendi şüphem / gözlemim' }).click();
  await next(page);
  await page
    .getByRole('textbox', { name: 'Genellikle kahvaltıda ne yersin?' })
    .fill('Yulaf ve yoğurt');
  await next(page);
  await expect(page.getByRole('textbox', { name: /Genellikle ne kadar tüketirsin/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Soruları modelle özelleştir' })).toBeDisabled();
  await page.screenshot({ path: 'docs/screenshots/onboarding-questions.png' });
  await next(page);
  await page.getByRole('button', { name: 'Profili kaydet', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Etiketi tara', exact: true })).toBeVisible();
  const encrypted = await page.evaluate(() => sessionStorage.getItem('etiket.health.v1'));
  expect(encrypted).not.toContain('Yulaf');
  expect(encrypted).not.toContain('şişkinlik');
  expect(JSON.parse(encrypted ?? '{}').ciphertext).toBeTruthy();
  expect(await page.evaluate(() => localStorage.getItem('etiket.health.v1'))).toBeNull();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Örnek etiketi incele' }).click();
  await page.getByRole('textbox', { name: 'Porsiyon (g)' }).fill('40');
  await expect(
    page.getByText('Enerji: 160 kcal / seçtiğin porsiyon', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Bulut modeliyle ayrıntılandır' })).toBeDisabled();
  await expect(page.getByText('YEREL DEĞERLENDİRME / API ÇAĞRISI YOK')).toBeVisible();
  expect(localCloudCalls).toBe(0);
  await page.screenshot({ path: 'docs/screenshots/personal-portion.png' });
  await page.getByRole('button', { name: 'Bu öğünü günlüğe ekle' }).click();
  await expect(page.getByRole('textbox', { name: 'Ne yedin?' })).toHaveValue(
    'Kakaolu yulaflı bisküvi',
  );
  await page.getByRole('textbox', { name: 'Porsiyon / miktar' }).fill('40 g');
  await page.getByRole('button', { name: 'Günlüğe kaydet' }).click();
  await expect(
    page.getByRole('button', { name: 'Kakaolu yulaflı bisküvi kaydını düzenle' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Kakaolu yulaflı bisküvi kaydını düzenle' }).click();
  await page.getByRole('checkbox', { name: 'Şişkinlik', exact: true }).click();
  await page.getByRole('textbox', { name: 'Ne kadar sonra başladı?' }).fill('2 saat');
  await page.getByRole('button', { name: 'Günlüğe kaydet' }).click();
  await page.screenshot({ path: 'docs/screenshots/meal-diary.png' });
  await page.getByRole('button', { name: 'Kakaolu yulaflı bisküvi kaydını sil' }).click();
  await expect(page.getByText('Henüz öğün kaydı yok.')).toBeVisible();
  await page.getByRole('button', { name: 'Geri', exact: true }).click();
  await page.getByRole('button', { name: 'Profilimi düzenle', exact: true }).click();
  for (let i = 0; i < 5; i++) await next(page);
  await page.getByRole('button', { name: 'Profil ve günlüğü sil', exact: true }).click();
  await page.getByRole('button', { name: 'Silme işlemini onayla', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Şimdilik geç' })).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('etiket.health.v1'))).toBeNull();
  expect(await page.evaluate(() => sessionStorage.getItem('etiket.health-key.v1'))).toBeNull();
});
test('explicit consent enables grounded model interpretation and question selection', async ({
  page,
}) => {
  let calls = 0;
  await page.route('**/api/personalize', async (route) => {
    calls++;
    const input = route.request().postDataJSON();
    expect(input.consent).toBe(true);
    expect(input.profile.geminiConsent).toBe(true);
    const data = {
      ...emptyProfile,
      goals: ['symptoms' as const],
      symptoms: ['bloating' as const],
      geminiConsent: true,
    };
    const result = {
      summary: 'Bu kontrollü model test yanıtıdır.',
      findings:
        input.task === 'interpret'
          ? [
              {
                text: 'Etikette yulaf var; kişisel tetikleyici olduğu kanıtlanmadı.',
                evidenceIds: ['label:text', 'profile:symptoms'],
              },
            ]
          : [],
      questionIds: ['context'],
    };
    await route.fulfill({
      json: {
        result,
        evidence: personalEvidence({
          consent: true,
          profile: data,
          diary: [],
          analysis: input.task === 'interpret' ? demoAnalysis : null,
          task: input.task,
        }),
        model: 'test-double',
        usage: { input_tokens: 1200, output_tokens: 300 },
      },
    });
  });
  await start(page);
  await page.getByRole('checkbox', { name: 'Belirtilerimi anlamak' }).click();
  await next(page);
  await page.getByRole('checkbox', { name: 'Şişkinlik', exact: true }).click();
  await next(page);
  await next(page);
  await next(page);
  expect(calls).toBe(0);
  await page.getByRole('checkbox', { name: /Profil özetimi kişisel yorum/ }).click();
  await page.getByRole('button', { name: 'Soruları modelle özelleştir' }).click();
  await expect(page.getByRole('textbox', { name: /Aynı öğünde başka neler/ })).toBeVisible();
  await expect.poll(() => calls).toBe(1);
  await next(page);
  await page.getByRole('button', { name: 'Profili kaydet', exact: true }).click();
  await page.getByRole('button', { name: 'Örnek etiketi incele' }).click();
  await page.getByRole('button', { name: 'Bulut modeliyle ayrıntılandır' }).click();
  await expect(page.getByText('Bu kontrollü model test yanıtıdır.')).toBeVisible();
  await expect.poll(() => calls).toBe(2);
  await page.screenshot({ path: 'docs/screenshots/personal-model-attribution.png' });
});

test('isolated demo asks a follow-up and sends the saved answer on re-evaluation', async ({
  page,
}) => {
  let calls = 0;
  await page.route('**/api/personalize', async (route) => {
    const input = route.request().postDataJSON();
    expect(input.scenario).toBe(true);
    expect(input.profile.geminiConsent).toBe(true);
    expect(input.diary.every((entry: { demo?: boolean }) => entry.demo)).toBe(true);
    calls++;
    const second = calls === 2;
    if (second) expect(input.diary[0].notes).toContain('Yanında 200 ml süt içtim.');
    await route.fulfill({
      json: {
        model: 'gemini-3.1-flash-lite',
        evidence: personalEvidence(input),
        usage: { input_tokens: 1400, output_tokens: 220 },
        result: {
          summary: second ? 'Süt ve porsiyon aynı anda değişmiş.' : 'Yulaf iki öğünde de var.',
          findings: [],
          questionIds: [],
          ...(second ? {} : { followUp: { diaryId: 'diary:0', question: 'Yulafı neyle yedin?' } }),
        },
      },
    });
  });
  await start(page);
  await page.getByRole('button', { name: 'Şimdilik geç' }).click();
  const vaultBefore = await page.evaluate(() => sessionStorage.getItem('etiket.health.v1'));
  await page.getByRole('button', { name: 'Örnek profille kişisel yorumu dene' }).click();
  await expect(page.getByText('Yulaf kasesi', { exact: false }).first()).toBeVisible();
  const cloud = page.getByRole('button', { name: 'Bulut modeliyle ayrıntılandır' });
  await expect(cloud).toBeDisabled();
  await page
    .getByRole('checkbox', { name: 'Kurgu profili ve örnek öğünleri Gemini’ye gönder' })
    .click();
  await cloud.click();
  await expect(page.getByText('Yulafı neyle yedin?')).toBeVisible();
  await page
    .getByRole('textbox', { name: 'Takip sorusuna cevap' })
    .fill('Yanında 200 ml süt içtim.');
  await page.getByRole('button', { name: 'Cevabı kaydet ve yeniden yorumla' }).click();
  await expect(page.getByText('Süt ve porsiyon aynı anda değişmiş.')).toBeVisible();
  expect(calls).toBe(2);
  expect(await page.evaluate(() => sessionStorage.getItem('etiket.health.v1'))).toBe(vaultBefore);
  await page.getByRole('button', { name: 'Hazır yanıtlarla prova yap' }).click();
  await expect(
    page.getByText('Hazır kurgu yanıt. Bu prova Gemini’ye istek göndermez.'),
  ).toBeVisible();
  await page
    .getByRole('textbox', { name: 'Takip sorusuna cevap' })
    .fill('Yanında 200 ml süt içtim.');
  await page.getByRole('button', { name: 'Cevabı kaydet ve yeniden yorumla' }).click();
  await expect(page.getByText(/İki ayrıntı birlikte değiştiği için/)).toBeVisible();
  expect(calls).toBe(2);
});
