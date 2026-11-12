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
      profile: {
        goals: ['awareness'],
        openaiConsent: true,
        conditions: 'Sütlü kahvaltıdan sonra bazen şişiyorum. Tanı almadım.',
      },
    });
    if (commentCalls === 1) {
      expect(route.request().postDataJSON().diary).toMatchObject([
        { meal: 'Suyla pişmiş yulaf', outcome: 'symptom_free', delay: '' },
        { meal: 'Sütlü yulaf', outcome: 'symptoms', symptoms: ['bloating'], delay: '1–2 saat' },
      ]);
    }
    return route.fulfill({
      json: {
        model: 'gpt-6-luna',
        evidence: [],
        usage: { input_tokens: 10, output_tokens: 10 },
        result: {
          summary: 'Bu bisküvide yulaf var.',
          decision: 'Günlüğünde yulaf tek başına öne çıkmıyor.',
          recommendation: 'Sütle yiyeceksen şişkinlik olup olmadığını izle.',
          findings: [{ text: 'Ayrıntılı günlük karşılaştırması.', evidenceIds: ['diary:0'] }],
          questionIds: [],
        },
      },
    });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Hesapsız dene' }).click();
  const next = page.getByRole('button', { name: 'Devam et', exact: true });
  await next.click();
  await expect(page.getByText('Devam etmek için en az bir amaç seç.')).toBeVisible();
  await page.getByRole('checkbox', { name: 'İçeriği anlamak' }).click();
  await next.click();
  await next.click();
  const condition = page.getByRole('textbox', { name: /Paylaşmak istediğin sağlık durumu/ });
  await expect(condition).not.toBeEditable();
  await page.getByRole('radio', { name: 'Kendi şüphem / gözlemim' }).click();
  await condition.fill('Reflü şüphesi');
  await page.getByRole('radio', { name: 'Tanı bilgisi paylaşmıyorum' }).click();
  await expect(condition).not.toBeEditable();
  await expect(condition).toHaveValue('');
  await page.getByRole('radio', { name: 'Kendi şüphem / gözlemim' }).click();
  await condition.fill('Sütlü kahvaltıdan sonra bazen şişiyorum. Tanı almadım.');
  await next.click();
  await page
    .getByRole('textbox', { name: 'Genellikle kahvaltıda ne yersin?' })
    .fill('İş günlerinde peynirli tost, evdeyken muzlu yulaf.');
  await page
    .getByRole('textbox', { name: /Belirti olursa yemekten yaklaşık/ })
    .fill('Genelde bir saat sonra.');
  await page
    .getByRole('textbox', { name: /Ana öğünlerini genellikle/ })
    .fill('Kahvaltı 08.30, öğle 13.00, akşam 19.30.');
  await next.click();
  await next.click();
  await page.getByRole('checkbox', { name: /Etiket okuduğumda kişisel yorum/ }).click();
  await page.getByRole('button', { name: 'Profili kaydet' }).click();
  await page.getByRole('button', { name: 'Öğün ve belirti günlüğüm' }).click();
  const mealName = page.getByRole('textbox', { name: 'Ne yedin?' });
  const mealIngredients = page.getByRole('textbox', { name: /Teyit ettiğin bileşenler/ });
  const saveMeal = page.getByRole('button', { name: 'Günlüğe kaydet' });
  await mealName.fill('Sütlü yulaf');
  await mealIngredients.fill('Yulaf ezmesi, Süt, Muz');
  await page.getByRole('checkbox', { name: 'Şişkinlik', exact: true }).click();
  await page.getByRole('radio', { name: '1–2 saat', exact: true }).click();
  await saveMeal.click();
  await expect(page.getByRole('button', { name: 'Sütlü yulaf kaydını düzenle' })).toBeVisible();
  await mealName.fill('Suyla pişmiş yulaf');
  await mealIngredients.fill('Yulaf ezmesi, Su, Muz');
  await page.getByRole('checkbox', { name: 'Belirti yok', exact: true }).click();
  await saveMeal.click();
  await expect(
    page.getByRole('button', { name: 'Suyla pişmiş yulaf kaydını düzenle' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Geri', exact: true }).click();
  await page.getByRole('button', { name: 'Öğreticiyi aç' }).click();
  await expect(page.getByRole('heading', { name: 'Örnek okuma' })).toBeVisible();
  await page.getByRole('button', { name: 'Kapat', exact: true }).click();
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Galeriden seç', exact: true }).click();
  await (await chooser).setFiles('tests/fixtures/example-label.jpg');
  await page.getByRole('button', { name: 'Fotoğrafı buluta gönder ve oku' }).click();
  await expect(page.getByText('Etiket okunuyor…', { exact: true })).toBeVisible();
  releaseAnalysis();
  const decision = page.getByText('Günlüğünde yulaf tek başına öne çıkmıyor.');
  const recommendation = page.getByText('Sütle yiyeceksen şişkinlik olup olmadığını izle.');
  await expect(decision).toBeVisible();
  await expect(page.getByText('Öneri', { exact: true })).toBeVisible();
  await expect(recommendation).toBeVisible();
  await expect(page.getByText('Bu bisküvide yulaf var.', { exact: true })).toBeHidden();
  await expect(page.getByText('Ayrıntılı günlük karşılaştırması.')).toBeHidden();
  await page.getByRole('tab', { name: 'İçerik', exact: true }).click();
  await expect(decision).toBeHidden();
  await expect(recommendation).toBeHidden();
  await page.getByRole('tab', { name: 'Özet', exact: true }).click();
  await expect(decision).toBeVisible();
  await expect(recommendation).toBeVisible();
  expect(commentCalls).toBe(1);
  await page
    .getByRole('textbox', { name: 'Yedikten sonra nasıl hissettin?' })
    .fill('Bir saat sonra şişkinlik');
  await page.getByRole('button', { name: 'Öğün olarak ekle' }).click();
  await page.getByLabel('Öğün tarihi', { exact: true }).fill('2026-11-10');
  await page.getByLabel('Öğün saati', { exact: true }).fill('13:30');
  await expect(
    page.getByRole('textbox', { name: 'Birlikte yediklerin ve diğer gözlemlerin' }),
  ).toHaveValue('Bir saat sonra şişkinlik');
  await page.getByRole('checkbox', { name: 'Şişkinlik', exact: true }).click();
  await page.getByRole('radio', { name: '1–2 saat', exact: true }).click();
  await page.getByRole('button', { name: 'Günlüğe kaydet' }).click();
  await page.getByRole('button', { name: 'Kakaolu yulaflı bisküvi kaydını düzenle' }).click();
  await expect(
    page.getByRole('textbox', { name: 'Birlikte yediklerin ve diğer gözlemlerin' }),
  ).toHaveValue('Bir saat sonra şişkinlik');
  await expect(page.getByRole('radio', { name: '1–2 saat', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Geri', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Öğün eklendi' })).toBeDisabled();
  await page.getByRole('button', { name: 'Geri', exact: true }).click();
  await page.getByRole('button', { name: 'Son okumaların' }).click();
  await expect(page.getByRole('button', { name: 'Öğün eklendi' })).toBeDisabled();
});

test('demo opens with a week of meals and keeps the real profile separate', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Bu demoda sizi ne bekliyor?' })).toBeVisible();
  await page.getByRole('button', { name: 'İleri' }).click();
  await expect(page.getByRole('heading', { name: 'Etiketi okut' })).toBeInViewport();
  await page.getByRole('button', { name: 'Turu geç' }).click();
  const demoEntry = page.getByRole('button', { name: 'Demo profiliyle devam et' });
  await demoEntry.click();
  await expect(page.getByText(/günlüğünde 24 öğün var/)).toBeVisible();
  await page.getByRole('button', { name: 'Vazgeç' }).click();
  await expect(page.getByRole('heading', { name: 'Demo profilimizle tanış' })).toBeHidden();
  await demoEntry.click();
  await page.getByRole('button', { name: 'Demoya devam et' }).click();
  await expect(page.getByText('Demo · Kurgu profil ve öğünler')).toBeVisible();
  await page.getByRole('tab', { name: 'Geçmiş' }).click();
  await expect(page.getByRole('button', { name: 'Sade kraker okumasını aç' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Kuru üzümlü granola okumasını aç' }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Tara' }).click();
  await page.getByRole('button', { name: 'Öğün ve belirti günlüğüm' }).click();
  await expect(page.getByText('Son kayıtlar / 24')).toBeVisible();
  await expect(page.getByText('Suyla pişmiş yulaf', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Yoğurtlu granola kaydını düzenle' }).click();
  await expect(page.getByRole('radio', { name: '30–60 dakika', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Demodan çık' }).click();
  await page.getByRole('button', { name: 'Hesapsız dene' }).click();
  await expect(page.getByRole('heading', { name: 'Etikette neye bakarsın?' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'İçeriği anlamak' })).not.toBeChecked();
});
