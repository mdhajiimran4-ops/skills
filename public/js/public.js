// public.js - Public Module (Home, About, How It Works, Contact)
function handlePublicNav(subView) {
  // Update sub-nav tabs
  document.querySelectorAll('.sub-nav-tab').forEach(t => t.classList.remove('active'));
  const activeTab = document.getElementById(`snav-public-${subView}`);
  if (activeTab) activeTab.classList.add('active');

  // Toggle sub-views
  document.querySelectorAll('#module-public .sub-view').forEach(v => v.classList.remove('active'));
  const targetSubView = document.getElementById(`pview-public-${subView}`);
  if (targetSubView) targetSubView.classList.add('active');
}

async function handlePublicContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const subject = document.getElementById('contactSubject').value.trim();
  const message = document.getElementById('contactMessage').value.trim();

  try {
    const res = await fetch('/api/public/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send message');

    document.getElementById('contactForm').reset();
    showToast(data.message, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}
