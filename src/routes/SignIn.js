import { loadAuthUsers, signIn } from '../services/authClient.js';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function selectedUser(users, selectedSlotId) {
  return users.find((user) => user.slotId === selectedSlotId || user.id === selectedSlotId) || users[0] || null;
}

function statusLabel(user) {
  if (!user?.pinSet) return 'Setup';
  if (!user.usernameSet) return 'Name needed';
  return 'Ready';
}

export async function renderSignIn({ selectedSlotId = '', error = '' } = {}) {
  let users = [];
  let loadError = '';

  try {
    users = await loadAuthUsers();
  } catch (err) {
    loadError = err.message || 'Failed to load player slots.';
  }

  const active = selectedUser(users, selectedSlotId);
  const needsSetup = active ? !active.pinSet : false;
  const needsUsername = active ? !active.usernameSet : false;
  const showUsername = needsSetup || needsUsername;

  return `
    <main class="auth-screen">
      <section class="auth-panel">
        <span class="section-kicker">Commune TCG</span>
        <h1 class="auth-title">Choose your vault.</h1>
        <p class="auth-copy">Pick one of the seven player slots, set a 10-character username, and use a 4-digit PIN to enter.</p>

        ${loadError ? `<div class="auth-error">${escapeHtml(loadError)}</div>` : ''}
        ${error ? `<div class="auth-error">${escapeHtml(error)}</div>` : ''}

        <div class="auth-slot-grid" data-auth-slots>
          ${users.map((user) => `
            <button class="auth-slot ${active?.slotId === user.slotId ? 'is-active' : ''}" type="button" data-auth-slot="${escapeHtml(user.slotId)}" style="--slot-color:${escapeHtml(user.color || '#f3c93f')}">
              <strong>${escapeHtml(user.displayName)}</strong>
              <span>${escapeHtml(statusLabel(user))}</span>
            </button>
          `).join('')}
        </div>

        ${active ? `
          <form class="auth-form" data-auth-form data-slot-id="${escapeHtml(active.slotId)}" data-setup="${needsSetup ? 'true' : 'false'}" data-needs-username="${needsUsername ? 'true' : 'false'}">
            <label>
              <span>${showUsername ? 'Username' : `PIN for ${escapeHtml(active.displayName)}`}</span>
              ${showUsername ? `<input name="username" maxlength="10" autocomplete="username" placeholder="10 max" value="${escapeHtml(active.username || '')}" />` : ''}
            </label>
            <label>
              <span>${needsSetup ? 'Set 4-digit PIN' : 'Enter 4-digit PIN'}</span>
              <input name="pin" type="password" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="••••" />
            </label>
            ${needsSetup ? `
              <label>
                <span>Confirm PIN</span>
                <input name="confirm" type="password" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="••••" />
              </label>
            ` : ''}
            <button class="button button-primary" type="submit">${needsSetup ? 'Create Vault' : 'Enter Vault'}</button>
          </form>
        ` : ''}
      </section>
    </main>
  `;
}

export function initSignIn(root, rerender) {
  root.querySelectorAll('[data-auth-slot]').forEach((button) => {
    button.addEventListener('click', () => {
      rerender({ selectedSlotId: button.dataset.authSlot || '' });
    });
  });

  const form = root.querySelector('[data-auth-form]');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const slotId = form.dataset.slotId || '';
    const setup = form.dataset.setup === 'true';
    const needsUsername = form.dataset.needsUsername === 'true';
    const username = String(formData.get('username') || '').trim();
    const pin = String(formData.get('pin') || '');
    const confirm = String(formData.get('confirm') || '');

    if ((setup || needsUsername) && (!username || username.length > 10)) {
      rerender({ selectedSlotId: slotId, error: 'Username must be 1-10 characters.' });
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      rerender({ selectedSlotId: slotId, error: 'Use exactly 4 digits.' });
      return;
    }

    if (setup && pin !== confirm) {
      rerender({ selectedSlotId: slotId, error: 'PINs do not match.' });
      return;
    }

    try {
      await signIn({ slotId, username, pin, confirm, setup });
      window.location.hash = '#/home';
      window.dispatchEvent(new Event('hashchange'));
    } catch (err) {
      rerender({ selectedSlotId: slotId, error: err.message || 'Sign-in failed.' });
    }
  });
}
