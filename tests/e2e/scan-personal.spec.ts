import { expect, test } from '@playwright/test';
import { demoAnalysis } from '../../src/data/demo';

test('new scans show the automatic profile comment and keep it across tabs', async ({ page }) => {
  let releaseAnalysis = (): void => {};
  const pendingAnalysis = new Promise<void>((resolve) => {
    releaseAnalysis = resolve;
  });
  await page.route('**/api/analyze', async (route) => {
    await pendingAnalysis;
    await route.fulfill({ json: { analysis: demoAnalysis } });
  });
  let commentCalls = 0;
  await page.route('**/api/personalize', (route) => {
    commentCalls++;
    expect(route.request().postDataJSON()).toMatchObject({
      task: 'interpret',
      profile: { goals: ['awareness'], openaiConsent: true },
    });
    return route.fulfill({
      json: {
        model: 'gpt-6-luna',
        evidence: [],
        usage: { input_tokens: 10, output_tokens: 10 },
        result: { summary: 'Bu bisküvide yulaf var.', findings: [], questionIds: [] },
      },
    });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Hesapsız dene' }).click();
  const next = page.getByRole('button', { name: 'Devam et', exact: true });
  await next.click();
  await expect(page.getByText('Devam etmek için en az bir amaç seç.')).toBeVisible();
  await page.getByRole('checkbox', { name: 'İçeriği anlamak' }).click();
  for (let step = 0; step < 5; step++) await next.click();
  await page.getByRole('checkbox', { name: /Etiket okuduğumda kişisel yorum/ }).click();
  await page.getByRole('button', { name: 'Profili kaydet' }).click();
  await page.getByRole('button', { name: 'Öğreticiyi aç' }).click();
  await expect(page.getByRole('heading', { name: 'Örnek okuma' })).toBeVisible();
  await page.getByRole('button', { name: 'Kapat', exact: true }).click();
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Galeriden seç', exact: true }).click();
  await (await chooser).setFiles('tests/fixtures/example-label.jpg');
  await page.getByRole('button', { name: 'Fotoğrafı buluta gönder ve oku' }).click();
  await expect(page.getByText('Etiket okunuyor…', { exact: true })).toBeVisible();
  releaseAnalysis();
  const summary = page.getByText('Bu bisküvide yulaf var.', { exact: true });
  await expect(summary).toBeVisible();
  await page.getByRole('tab', { name: 'İçerik', exact: true }).click();
  await expect(summary).toBeHidden();
  await page.getByRole('tab', { name: 'Özet', exact: true }).click();
  await expect(summary).toBeVisible();
  expect(commentCalls).toBe(1);
});
