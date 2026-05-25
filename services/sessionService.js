const sessions = {};

function get(sessionId) { return sessions[sessionId] || null; }

function set(sessionId, data) {
  sessions[sessionId] = { ...data, debut: Date.now() };
}

function update(sessionId, data) {
  if (sessions[sessionId]) {
    sessions[sessionId] = { ...sessions[sessionId], ...data };
  }
}

function remove(sessionId) { delete sessions[sessionId]; }

// Nettoyage automatique apres 10 minutes
setInterval(() => {
  const maintenant = Date.now();
  Object.keys(sessions).forEach(id => {
    if (maintenant - sessions[id].debut > 10 * 60 * 1000) {
      delete sessions[id];
    }
  });
}, 5 * 60 * 1000);

module.exports = { get, set, update, remove };
