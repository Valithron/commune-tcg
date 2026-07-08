import { renderPull } from './Pull.js';

export async function renderPullConfirm({ query = {} } = {}) {
  return renderPull({ query });
}
