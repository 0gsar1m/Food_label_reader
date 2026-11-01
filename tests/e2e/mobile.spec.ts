import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';
import { demoAnalysis } from '../../src/data/demo';

const fixture = path.resolve('tests/fixtures/example-label.jpg');
async function openHome(page: Page): Promise<void> {
  await page.goto('/');
  const guest = page.getByRole('button', { name: 'Hesapsız dene' });
  const already = page.getByRole('button', { name: 'Şimdilik geç' });
  await Promise.race([
    guest.waitFor(),
    already.waitFor(),
    page.getByRole('button', { name: 'Etiketi tara', exact: true }).waitFor(),
  ]);
  if (await guest.isVisible()) await guest.click();
  const skip = page.getByRole('button', { name: 'Şimdilik geç' });
  await Promise.race([
    skip.waitFor(),
    page.getByRole('button', { name: 'Etiketi tara', exact: true }).waitFor(),
  ]);
  if (await skip.isVisible()) await skip.click();
  await expect(page.getByRole('button', { name: 'Etiketi tara', exact: true })).toBeVisible();
}
async function upload(page: Page): Promise<void> {
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Galeriden seç', exact: true }).click();
  await (await chooser).setFiles(fixture);
  await expect(page.getByRole('button', { name: 'Fotoğrafı gönder ve oku' })).toBeVisible();
}
async function noOverflow(page: Page): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
}

test('main screen has no overflow at phone and desktop sizes', async ({ page }) => {
  await openHome(page);
  for (const width of [320, 360, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page);
    await page.screenshot({ path: `docs/screenshots/home-${width}.png` });
  }
});

test('example is explicit, evidence tabs work and example never enters history', async ({
  page,
}) => {
  await openHome(page);
  await page.getByRole('button', { name: 'Örnek etiketi incele' }).click();
  await expect(
    page.getByText('ÖRNEK SONUÇ / Kurgu bir etikettir. Fotoğraf analizi yapılmadı.'),
  ).toBeVisible();
  await expect(page.getByText('Eser miktarda içerebilir', { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/result-summary.png' });
  await page.getByRole('tab', { name: 'İçerik', exact: true }).click();
  await expect(page.getByText('Yulaf ezmesi', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/result-ingredients.png' });
  await page.getByRole('tab', { name: 'Etiket metni' }).click();
  await expect(page.getByText(demoAnalysis.rawText, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Geri', exact: true }).click();
  await page.getByRole('tab', { name: 'Geçmiş', exact: true }).click();
  await expect(page.getByText('İlk etiketin için hazır.')).toBeVisible();
});

test('preferences persist, highlight a matching declaration, and draft policies open', async ({
  page,
}) => {
  await openHome(page);
  await page.getByRole('tab', { name: 'Tercihler' }).click();
  await page.getByRole('checkbox', { name: 'Süt', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Süt', exact: true })).toBeChecked();
  await page.reload();
  await page.getByRole('tab', { name: 'Tercihler' }).click();
  await expect(page.getByRole('checkbox', { name: 'Süt', exact: true })).toBeChecked();
  await page.screenshot({ path: 'docs/screenshots/preferences.png' });
  await page.getByRole('link', { name: 'Gizlilik politikası', exact: true }).click();
  await expect(page.getByText('Verin nerede kalır?')).toBeVisible();
  await expect(page.getByText('TASLAK / 1 KASIM 2026')).toBeVisible();
  await page.getByRole('button', { name: 'Geri', exact: true }).click();
  await page.getByRole('link', { name: 'Kullanım koşulları', exact: true }).click();
  await expect(page.getByText('Okumadan önce.')).toBeVisible();
  await page.getByRole('button', { name: 'Geri', exact: true }).click();
  await page.getByRole('tab', { name: 'Tara', exact: true }).click();
  await page.getByRole('button', { name: 'Örnek etiketi incele' }).click();
  await expect(page.getByText(/Seçtiğin alerjenlerle eşleşen beyan var: Süt/)).toBeVisible();
});

test('gallery preview requires consent, saves validated result and supports search/delete', async ({
  page,
}) => {
  let requests = 0;
  await page.route('**/api/analyze', async (route) => {
    requests++;
    expect(route.request().postDataJSON().mimeType).toBe('image/jpeg');
    expect(route.request().postDataJSON().preferences).toBeUndefined();
    await route.fulfill({ json: { analysis: demoAnalysis, model: 'test-double' } });
  });
  await openHome(page);
  await upload(page);
  expect(requests).toBe(0);
  await page.screenshot({ path: 'docs/screenshots/review.png' });
  await page.getByRole('button', { name: 'Fotoğrafı gönder ve oku' }).click();
  await expect(page.getByText('Kakaolu yulaflı bisküvi', { exact: true })).toBeVisible();
  expect(requests).toBe(1);
  await page.getByRole('button', { name: 'Geri', exact: true }).click();
  await page.getByRole('tab', { name: 'Geçmiş' }).click();
  await page.getByRole('textbox', { name: 'Geçmişte ara' }).fill('SÜT');
  await expect(
    page.getByRole('button', { name: /Kakaolu yulaflı bisküvi okumasını aç/ }),
  ).toBeVisible();
  await page.getByRole('textbox', { name: 'Geçmişte ara' }).fill('olmayan ürün');
  await expect(page.getByText('Bu aramayla eşleşen okuma yok.')).toBeVisible();
  await page.reload();
  await page.getByRole('tab', { name: 'Geçmiş' }).click();
  await expect(
    page.getByRole('button', { name: /Kakaolu yulaflı bisküvi okumasını aç/ }),
  ).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/history.png' });
  await page.getByRole('button', { name: 'Tüm geçmişi sil' }).click();
  await page.getByRole('button', { name: 'Vazgeç', exact: true }).click();
  await expect(
    page.getByRole('button', { name: /Kakaolu yulaflı bisküvi okumasını aç/ }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Tüm geçmişi sil' }).click();
  await page.getByRole('button', { name: 'Evet, geçmişi sil' }).click();
  await expect(page.getByText('İlk etiketin için hazır.')).toBeVisible();
});

test('missing configuration shows a useful error, not a synthetic analysis', async ({ page }) => {
  await page.route('**/api/analyze', (route) =>
    route.fulfill({ status: 503, json: { error: 'NOT_CONFIGURED' } }),
  );
  await openHome(page);
  await upload(page);
  await page.getByRole('button', { name: 'Fotoğrafı gönder ve oku' }).click();
  await expect(page.getByText(/Sunucuda Gemini anahtarı henüz tanımlanmamış/)).toBeVisible();
  await expect(page.getByText('Kakaolu yulaflı bisküvi', { exact: true })).toHaveCount(0);
  await page.screenshot({ path: 'docs/screenshots/scan-error.png' });
});

test('camera permission screen gives a working gallery alternative', async ({ page }) => {
  await openHome(page);
  await page.getByRole('button', { name: 'Etiketi tara', exact: true }).click();
  await expect(page.getByText('Etikete yakından bak.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Kameraya izin ver' })).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/camera-permission.png' });
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Galeriden seç', exact: true }).click();
  await (await chooser).setFiles(fixture);
  await expect(page.getByRole('button', { name: 'Fotoğrafı gönder ve oku' })).toBeVisible();
});

test('result remains readable at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await openHome(page);
  await page.getByRole('button', { name: 'Örnek etiketi incele' }).click();
  await noOverflow(page);
  await page.screenshot({ path: 'docs/screenshots/result-320.png' });
});
