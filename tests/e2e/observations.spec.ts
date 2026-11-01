import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';

async function openHome(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Hesapsız dene' }).click();
  await page.getByRole('button', { name: 'Şimdilik geç' }).click();
}
test('pending check-ins become observations only after explicit completion and reports print locally', async ({
  page,
}) => {
  let paidCalls = 0;
  await page.route('**/api/**', (route) => {
    paidCalls++;
    return route.abort();
  });
  await openHome(page);
  await page.getByRole('button', { name: 'Öğün ve belirti günlüğüm' }).click();
  await page.getByRole('textbox', { name: 'Ne yedin?' }).fill('Yoğurt ve yulaf');
  await page
    .getByRole('textbox', { name: 'Teyit ettiğin bileşenler (virgülle ayır)' })
    .fill('Yoğurt, yulaf');
  await page.getByRole('checkbox', { name: 'Henüz değerlendirmedim' }).click();
  await page.getByRole('button', { name: 'Günlüğe kaydet' }).click();
  await page.getByRole('button', { name: 'Geri', exact: true }).click();
  await page.getByRole('button', { name: 'Gözlemlerim', exact: true }).click();
  await expect(page.getByText('1 öğün için kontrol bekliyor')).toBeVisible();
  await expect(page.getByText('0 tamamlanan kontrol · 0 belirtisiz')).toBeVisible();
  await page.getByRole('button', { name: 'Öğün sonrası kontrol yap' }).click();
  await page.getByRole('button', { name: 'Yoğurt ve yulaf kaydını düzenle' }).click();
  await page.getByRole('checkbox', { name: 'Şişkinlik', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Hafif', exact: true }).click();
  await page.getByRole('button', { name: 'Günlüğe kaydet' }).click();
  await page.getByRole('button', { name: 'Geri', exact: true }).click();
  await expect(page.getByText('1 tamamlanan kontrol · 0 belirtisiz')).toBeVisible();
  await expect(
    page.getByText('1 öğünde kayıtlı: 1 belirtili, 0 belirtisiz.').first(),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Son 30 gün' }).click();
  await page.screenshot({ path: 'docs/screenshots/observations-390.png' });
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: `docs/screenshots/observations-${width}.png` });
  }
  const popup = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Raporu PDF olarak dışa aktar' }).click();
  const report = await popup;
  await expect(report.locator('body')).toContainText('Yoğurt ve yulaf');
  await expect(report.locator('body')).toContainText('Şişkinlik');
  await report.close();
  expect(paidCalls).toBe(0);
});

test('menu scan requires transfer and meal confirmation before a pending encrypted diary record', async ({
  page,
}) => {
  let calls = 0;
  await page.route('**/api/food-context', async (route) => {
    calls++;
    expect(route.request().postDataJSON().mode).toBe('menu');
    expect(route.request().postDataJSON().profile).toBeUndefined();
    await route.fulfill({
      json: {
        result: {
          title: 'Günün menüsü',
          visibleText: 'Mercimek çorbası',
          items: [{ name: 'Mercimek çorbası', basis: 'printed', evidence: 'Mercimek çorbası' }],
          questions: ['Pişirme yağı nedir?'],
          uncertainties: ['Çapraz temas bilinmiyor.'],
        },
      },
    });
  });
  await openHome(page);
  await page.getByRole('button', { name: 'Dışarıda yemek / restoran kartım' }).click();
  await expect(
    page.getByText('Kartına henüz alerjen veya kaçındığın gıda eklemedin.'),
  ).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/restaurant-card-390.png' });
  await page.getByRole('button', { name: 'Menü veya tabak fotoğrafı incele' }).click();
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Menü veya tabak için galeriden seç' }).click();
  await (await chooser).setFiles(path.resolve('tests/fixtures/example-menu.png'));
  await expect(page.getByRole('button', { name: 'Fotoğrafı gönder ve incele' })).toBeVisible();
  expect(calls).toBe(0);
  await page.getByRole('button', { name: 'Fotoğrafı gönder ve incele' }).click();
  await expect(page.getByText('Günün menüsü')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Teyit ettiğim öğünü günlüğe ekle' }),
  ).toBeDisabled();
  await page.getByRole('checkbox', { name: 'Mercimek çorbası tükettiğimi teyit ediyorum' }).click();
  await page.screenshot({ path: 'docs/screenshots/menu-review-390.png' });
  await page.getByRole('button', { name: 'Teyit ettiğim öğünü günlüğe ekle' }).click();
  await expect(page.getByRole('textbox', { name: 'Ne yedin?' })).toHaveValue('Mercimek çorbası');
  await expect(page.getByRole('checkbox', { name: 'Henüz değerlendirmedim' })).toBeChecked();
  await expect(
    page.getByRole('textbox', { name: 'Teyit ettiğin bileşenler (virgülle ayır)' }),
  ).toHaveValue('');
  await page.getByRole('button', { name: 'Günlüğe kaydet' }).click();
  expect(calls).toBe(1);
});

test('barcode catalogue has no model request, identifies source and offers photo fallback', async ({
  page,
}) => {
  let calls = 0;
  await page.route('**/api/barcode/*', async (route) => {
    calls++;
    await route.fulfill({
      json: {
        product: {
          code: '3017620422003',
          name: 'Katalog deneme ürünü',
          brands: 'Test',
          ingredientsText: 'Süt, yulaf',
          updatedAt: null,
        },
      },
    });
  });
  await openHome(page);
  await page.getByRole('button', { name: 'Barkoddan ürün bul' }).click();
  await page.getByRole('textbox', { name: 'Barkod numarası' }).fill('3017620422004');
  await page.getByRole('button', { name: 'Barkodu katalogda ara' }).click();
  await expect(page.getByText(/Geçerli bir EAN\/UPC barkodu gir/)).toBeVisible();
  expect(calls).toBe(0);
  await page.getByRole('textbox', { name: 'Barkod numarası' }).fill('3017620422003');
  await page.getByRole('button', { name: 'Barkodu katalogda ara' }).click();
  await expect(page.getByText('Katalog deneme ürünü', { exact: true })).toBeVisible();
  await expect(page.getByText(/Bu metin elindeki ambalajdan okunmadı/)).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/barcode-390.png' });
  await page.getByRole('button', { name: 'Bu ürünü öğün günlüğüne ekle' }).click();
  await expect(page.getByRole('textbox', { name: 'Ne yedin?' })).toHaveValue(
    'Katalog deneme ürünü',
  );
  expect(calls).toBe(1);
});
