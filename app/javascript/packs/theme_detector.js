// System tema için dark/light tercihi algılama
function detectSystemTheme() {
  const theme = window.CURRENT_THEME;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.cookie = "prefers_dark=" + prefersDark + ";path=/;max-age=31536000;SameSite=Lax";
  }
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', () => {
  detectSystemTheme();

  // Sistem teması değiştiğinde güncelle
  window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
    document.cookie = "prefers_dark=" + e.matches + ";path=/;max-age=31536000;SameSite=Lax";
    window.location.reload(); // Logoyu güncellemek için sayfayı yenile
  });
});