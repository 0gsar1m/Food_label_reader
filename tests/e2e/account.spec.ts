import { test, expect } from '@playwright/test';

test('Google entry gives an honest missing-client message and a working guest path', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Google ile devam et', exact: true }).click();
  await expect(
    page.getByText('Google OAuth istemci kimliği yapılandırılmamış. Hesapsız deneyebilirsin.'),
  ).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/google-login.png' });
  await page.getByRole('button', { name: 'Hesapsız dene' }).click();
  await expect(page.getByRole('button', { name: 'Şimdilik geç' })).toBeVisible();
});

test('account-scoped encrypted profile and library stay separate on sign-out and account switch', async ({
  page,
}) => {
  const session = (id: string) => ({
    token: 'test-session-token-not-a-live-jwt',
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    user: { id, email: `account${id}@example.com`, name: `Test ${id}` },
    origin: 'http://localhost:8787',
  });
  await page.addInitScript((value) => {
    if (!sessionStorage.getItem('test.seeded')) {
      sessionStorage.setItem('etiket.account.v1', JSON.stringify(value));
      sessionStorage.setItem('test.seeded', 'yes');
    }
  }, session('111'));
  await page.goto('/');
  await page.getByRole('checkbox', { name: 'Protein takibi', exact: true }).click();
  await page.getByRole('button', { name: 'Devam et', exact: true }).click();
  await page.getByRole('button', { name: 'Devam et', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Paylaşmak istediğin sağlık durumu veya hassasiyet' })
    .fill('Hesap A özel kaydı');
  await page.getByRole('button', { name: 'Devam et', exact: true }).click();
  await page.getByRole('button', { name: 'Devam et', exact: true }).click();
  await page.getByRole('button', { name: 'Devam et', exact: true }).click();
  await page.getByRole('button', { name: 'Profili kaydet', exact: true }).click();
  await page.getByRole('tab', { name: 'Tercihler' }).click();
  await page.getByRole('checkbox', { name: 'Süt', exact: true }).click();
  await page.getByRole('button', { name: 'Hesabım', exact: true }).click();
  await expect(page.getByText('account111@example.com')).toBeVisible();
  await page.getByRole('button', { name: 'Hesaptan çıkış yap' }).click();
  await expect(page.getByRole('button', { name: 'Hesapsız dene' })).toBeVisible();
  await page.getByRole('button', { name: 'Hesapsız dene' }).click();
  await page.getByRole('button', { name: 'Şimdilik geç' }).click();
  await page.getByRole('tab', { name: 'Tercihler' }).click();
  await expect(page.getByRole('checkbox', { name: 'Süt', exact: true })).not.toBeChecked();
  await page.evaluate(
    (value) => sessionStorage.setItem('etiket.account.v1', JSON.stringify(value)),
    session('222'),
  );
  await page.reload();
  await expect(page.getByRole('button', { name: 'Şimdilik geç' })).toBeVisible();
  await page.getByRole('button', { name: 'Devam et', exact: true }).click();
  await page.getByRole('button', { name: 'Devam et', exact: true }).click();
  await expect(
    page.getByRole('textbox', { name: 'Paylaşmak istediğin sağlık durumu veya hassasiyet' }),
  ).toHaveValue('');
  expect(await page.evaluate(() => sessionStorage.getItem('etiket.health.v1.111'))).not.toContain(
    'Hesap A özel kaydı',
  );
  await page.evaluate(
    (value) => sessionStorage.setItem('etiket.account.v1', JSON.stringify(value)),
    session('111'),
  );
  await page.reload();
  await page.getByRole('button', { name: 'Kullanım profilim', exact: true }).click();
  await page.getByRole('button', { name: 'Devam et', exact: true }).click();
  await page.getByRole('button', { name: 'Devam et', exact: true }).click();
  await expect(
    page.getByRole('textbox', { name: 'Paylaşmak istediğin sağlık durumu veya hassasiyet' }),
  ).toHaveValue('Hesap A özel kaydı');
});
