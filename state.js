<!-- state.js -->
<script>
/* OTOS Shared State — single source of truth */

window.OTOS = {
  keys: {
    signals: "otos_signals",
    focus: "otos_focus"
  },

  getSignals() {
    return JSON.parse(localStorage.getItem(this.keys.signals) || "[]");
  },

  addSignal(signal) {
    const data = this.getSignals();
    data.push({ ...signal, ts: Date.now() });
    localStorage.setItem(this.keys.signals, JSON.stringify(data));
  },

  getFocus() {
    const v = localStorage.getItem(this.keys.focus);
    return v === null ? 50 : Number(v);
  },

  setFocus(v) {
    localStorage.setItem(this.keys.focus, String(v));
  },

  velocity() {
    const data = this.getSignals();
    if (!data.length) return { state: "Dormant", count: 0, last: null };

    const last = data[data.length - 1];
    const mins = Math.floor((Date.now() - last.ts) / 60000);
    return {
      count: data.length,
      lastMins: mins,
      state: mins < 30 ? "Active" : "Cooling"
    };
  }
};
</script>
