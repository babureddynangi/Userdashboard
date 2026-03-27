// ============================================================================
// 360° Customer Intelligence Dashboard — Application Logic
// 10K customer support, overview dashboard, Q&A engine
// ============================================================================

(function () {
  'use strict';

  let qaOpen = false;

  // ── Initialize ──
  function init() {
    renderStats();
    renderOverview();
    setupSearch();
    setupQA();
  }

  // ══════════════════════════════════════════════════
  // STATS BAR
  // ══════════════════════════════════════════════════
  function renderStats() {
    document.getElementById('statCustomers').textContent = CUSTOMERS.length.toLocaleString();
    const totalAccounts = CUSTOMERS.reduce((s, c) => s + c.accounts.length, 0);
    const totalExposure = CUSTOMERS.reduce((s, c) => s + c.financial.totalOutstanding, 0);
    document.getElementById('statAccounts').textContent = totalAccounts.toLocaleString();
    document.getElementById('statExposure').textContent = '$' + (totalExposure / 1e6).toFixed(1) + 'M';
  }

  // ══════════════════════════════════════════════════
  // OVERVIEW DASHBOARD
  // ══════════════════════════════════════════════════
  function renderOverview() {
    // KPI Cards
    const low = CUSTOMERS.filter(c => c.risk.tier === 'low').length;
    const mod = CUSTOMERS.filter(c => c.risk.tier === 'moderate').length;
    const high = CUSTOMERS.filter(c => c.risk.tier === 'high').length;
    const totalOut = CUSTOMERS.reduce((s, c) => s + c.financial.totalOutstanding, 0);
    const totalLimit = CUSTOMERS.reduce((s, c) => s + c.financial.creditLimit, 0);
    const avgUtil = totalLimit > 0 ? (totalOut / totalLimit * 100).toFixed(1) : 0;
    const defaults = CUSTOMERS.reduce((s, c) => s + c.risk.defaults, 0);

    document.getElementById('kpiRow').innerHTML = `
      <div class="kpi-card">
        <div class="kpi-icon">👥</div>
        <div class="kpi-value">${CUSTOMERS.length.toLocaleString()}</div>
        <div class="kpi-label">Total Customers</div>
      </div>
      <div class="kpi-card risk-low">
        <div class="kpi-icon">🟢</div>
        <div class="kpi-value">${low.toLocaleString()}</div>
        <div class="kpi-label">Low Risk</div>
      </div>
      <div class="kpi-card risk-mod">
        <div class="kpi-icon">🟡</div>
        <div class="kpi-value">${mod.toLocaleString()}</div>
        <div class="kpi-label">Moderate Risk</div>
      </div>
      <div class="kpi-card risk-high">
        <div class="kpi-icon">🔴</div>
        <div class="kpi-value">${high.toLocaleString()}</div>
        <div class="kpi-label">High Risk</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">📊</div>
        <div class="kpi-value">${avgUtil}%</div>
        <div class="kpi-label">Avg Utilization</div>
      </div>
      <div class="kpi-card risk-high">
        <div class="kpi-icon">⚠️</div>
        <div class="kpi-value">${defaults.toLocaleString()}</div>
        <div class="kpi-label">Total Defaults</div>
      </div>`;

    // Risk distribution bar chart
    renderBarChart('riskDistChart', [
      { label: 'Low Risk', value: low, color: 'var(--risk-low)', max: CUSTOMERS.length },
      { label: 'Moderate Risk', value: mod, color: 'var(--risk-moderate)', max: CUSTOMERS.length },
      { label: 'High Risk', value: high, color: 'var(--risk-high)', max: CUSTOMERS.length }
    ]);

    // Top states
    const stateCounts = {};
    CUSTOMERS.forEach(c => { stateCounts[c.state] = (stateCounts[c.state] || 0) + 1; });
    const topStates = Object.entries(stateCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const maxState = topStates[0] ? topStates[0][1] : 1;
    renderBarChart('stateChart', topStates.map(([st, cnt]) => ({
      label: st, value: cnt, color: 'var(--accent-primary)', max: maxState
    })));

    // Top vendors
    const vendorCounts = {};
    CUSTOMERS.forEach(c => c.accounts.forEach(a => {
      vendorCounts[a.vendorId] = (vendorCounts[a.vendorId] || 0) + 1;
    }));
    const topVendors = Object.entries(vendorCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const maxVendor = topVendors[0] ? topVendors[0][1] : 1;
    renderBarChart('vendorChart', topVendors.map(([vid, cnt]) => {
      const v = getVendor(vid);
      return { label: v ? v.name : vid, value: cnt, color: 'var(--accent-primary)', max: maxVendor };
    }));

    // KYC status
    const kycCounts = { verified: 0, expired: 0, pending_update: 0 };
    CUSTOMERS.forEach(c => { kycCounts[c.kycStatus] = (kycCounts[c.kycStatus] || 0) + 1; });
    renderBarChart('kycChart', [
      { label: 'Verified', value: kycCounts.verified, color: 'var(--risk-low)', max: CUSTOMERS.length },
      { label: 'Pending Update', value: kycCounts.pending_update, color: 'var(--risk-moderate)', max: CUSTOMERS.length },
      { label: 'Expired', value: kycCounts.expired, color: 'var(--risk-high)', max: CUSTOMERS.length }
    ]);

    // Top 15 high-risk customers
    const highRisk = [...CUSTOMERS].sort((a, b) => b.risk.score - a.risk.score).slice(0, 15);
    document.getElementById('highRiskTable').innerHTML = `
      <table class="risk-table">
        <thead><tr>
          <th>Customer</th><th>ID</th><th>State</th><th>Risk Score</th>
          <th>Bureau</th><th>Defaults</th><th>Outstanding</th><th>Utilization</th>
        </tr></thead>
        <tbody>${highRisk.map(c => `<tr onclick="window._selectCustomer('${c.id}')">
          <td class="clickable-name">${c.avatar} ${c.name}</td>
          <td style="font-family:'JetBrains Mono',monospace;font-size:0.78rem;color:var(--text-muted);">${c.id}</td>
          <td>${c.state}</td>
          <td style="color:var(--risk-high);font-weight:700;font-family:'JetBrains Mono',monospace;">${c.risk.score}</td>
          <td style="font-family:'JetBrains Mono',monospace;">${c.risk.creditBureauScore}</td>
          <td style="color:${c.risk.defaults > 0 ? 'var(--risk-high)' : 'var(--risk-low)'};">${c.risk.defaults}</td>
          <td style="font-family:'JetBrains Mono',monospace;">${formatCurrency(c.financial.totalOutstanding)}</td>
          <td style="color:${c.financial.utilizationRate > 70 ? 'var(--risk-high)' : c.financial.utilizationRate > 40 ? 'var(--risk-moderate)' : 'var(--risk-low)'};">${c.financial.utilizationRate}%</td>
        </tr>`).join('')}</tbody>
      </table>`;
  }

  function renderBarChart(containerId, bars) {
    document.getElementById(containerId).innerHTML = '<div class="bar-chart">' + bars.map(b =>
      `<div class="bar-row">
        <div class="bar-label" title="${b.label}">${b.label}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${(b.value / b.max * 100).toFixed(1)}%;background:${b.color};">
            <span class="bar-value">${b.value.toLocaleString()}</span>
          </div>
        </div>
      </div>`
    ).join('') + '</div>';
  }

  // ══════════════════════════════════════════════════
  // SEARCH (optimized for 10K)
  // ══════════════════════════════════════════════════
  let searchTimer = null;
  function setupSearch() {
    const input = document.getElementById('searchInput');
    const dropdown = document.getElementById('searchDropdown');

    input.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        const q = input.value.trim().toLowerCase();
        if (q.length < 2) { dropdown.classList.remove('active'); return; }

        const matches = [];
        for (let i = 0; i < CUSTOMERS.length && matches.length < 20; i++) {
          const c = CUSTOMERS[i];
          if (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) ||
              c.id.toLowerCase().includes(q) || c.phone.includes(q) ||
              c.city.toLowerCase().includes(q) || c.state.toLowerCase().includes(q) ||
              c.stateName.toLowerCase().includes(q)) {
            matches.push(c);
          }
        }

        const total = CUSTOMERS.filter(c =>
          c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) || c.phone.includes(q) ||
          c.city.toLowerCase().includes(q) || c.state.toLowerCase().includes(q) ||
          c.stateName.toLowerCase().includes(q)
        ).length;

        let html = `<div class="search-result-count">${total.toLocaleString()} result${total !== 1 ? 's' : ''} found${total > 20 ? ' (showing top 20)' : ''}</div>`;

        if (matches.length === 0) {
          html += '<div class="search-item"><span style="color:var(--text-muted);font-size:0.82rem;">No matching customers</span></div>';
        } else {
          html += matches.map(c => {
            const riskCls = `badge-risk-${c.risk.tier}`;
            return `<div class="search-item" onclick="window._selectCustomer('${c.id}'); document.getElementById('searchInput').value=''; document.getElementById('searchDropdown').classList.remove('active');">
              <div class="search-item-avatar">${c.avatar}</div>
              <div class="search-item-info">
                <div class="search-item-name">${c.name}</div>
                <div class="search-item-detail">${c.city}, ${c.state} · ${c.email} · ${c.id}</div>
              </div>
              <span class="search-item-risk ${riskCls}">${c.risk.tier}</span>
            </div>`;
          }).join('');
        }
        dropdown.innerHTML = html;
        dropdown.classList.add('active');
      }, 150);
    });

    input.addEventListener('focus', () => {
      if (input.value.trim().length >= 2) {
        input.dispatchEvent(new Event('input'));
      }
    });

    document.addEventListener('click', (e) => {
      if (!document.getElementById('searchContainer').contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  }

  // ══════════════════════════════════════════════════
  // NAVIGATION
  // ══════════════════════════════════════════════════
  window._showOverview = function () {
    document.getElementById('overviewDashboard').style.display = '';
    document.getElementById('profileContainer').classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window._selectCustomer = function (id) {
    const customer = CUSTOMER_BY_ID[id];
    if (!customer) return;

    document.getElementById('overviewDashboard').style.display = 'none';
    const pc = document.getElementById('profileContainer');
    pc.classList.add('active');
    pc.style.animation = 'none';
    pc.offsetHeight;
    pc.style.animation = '';

    renderProfileHeader(customer);
    renderIdentity(customer);
    renderFinancial(customer);
    renderRisk(customer);
    renderAccounts(customer);
    renderPayments(customer);
    renderTimeline(customer);
    renderVendors(customer);
    renderLTV(customer);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ══════════════════════════════════════════════════
  // PROFILE SECTIONS (same as before, USD adapted)
  // ══════════════════════════════════════════════════
  function renderProfileHeader(c) {
    const kycClass = c.kycStatus === 'verified' ? 'badge-kyc-verified' :
      c.kycStatus === 'expired' ? 'badge-kyc-expired' : 'badge-kyc-pending';
    const kycLabel = c.kycStatus === 'verified' ? '✓ KYC Verified' :
      c.kycStatus === 'expired' ? '✕ KYC Expired' : '⏳ KYC Pending';
    document.getElementById('profileHeader').innerHTML = `
      <div class="profile-avatar">${c.avatar}</div>
      <div>
        <div class="profile-name">${c.name}</div>
        <div class="profile-id">${c.id} · Since ${formatDate(c.customerSince)} · ${calculateTenure(c.customerSince)} tenure</div>
      </div>
      <div class="profile-header-badges">
        <span class="badge ${kycClass}">${kycLabel}</span>
        <span class="badge badge-risk-${c.risk.tier}">Risk: ${c.risk.score}/100 (${c.risk.tier})</span>
      </div>`;
  }

  function renderIdentity(c) {
    const items = [
      { label: 'Full Name', value: c.name },
      { label: 'Date of Birth', value: `${formatDate(c.dob)} (${calculateAge(c.dob)}y)` },
      { label: 'Email', value: c.email },
      { label: 'Phone', value: c.phone, mono: true },
      { label: 'Address', value: c.address },
      { label: 'SSN', value: c.ssn, mono: true },
      { label: 'State', value: `${c.city}, ${c.state}` },
      { label: 'KYC Updated', value: formatDate(c.kycLastUpdated) }
    ];
    document.getElementById('identityGrid').innerHTML = items.map(i =>
      `<div class="info-item">
        <div class="info-label">${i.label}</div>
        <div class="info-value ${i.mono ? 'mono' : ''}">${i.value}</div>
      </div>`).join('');
  }

  function renderFinancial(c) {
    const f = c.financial;
    const utilColor = f.utilizationRate < 30 ? 'highlight-green' : f.utilizationRate < 70 ? 'highlight-amber' : 'highlight-red';
    const utilBarColor = f.utilizationRate < 30 ? 'var(--risk-low)' : f.utilizationRate < 70 ? 'var(--risk-moderate)' : 'var(--risk-high)';
    document.getElementById('financialContent').innerHTML = `
      <div class="metric-row"><span class="metric-label">Total Outstanding</span><span class="metric-value currency">${formatCurrency(f.totalOutstanding)}</span></div>
      <div class="metric-row"><span class="metric-label">Credit Limit</span><span class="metric-value">${formatCurrency(f.creditLimit)}</span></div>
      <div class="metric-row"><span class="metric-label">Utilization Rate</span><span class="metric-value ${utilColor}">${f.utilizationRate.toFixed(1)}%</span></div>
      <div class="metric-row"><span class="metric-label">Next Payment Due</span><span class="metric-value">${formatDate(f.nextPaymentDue)}</span></div>
      <div class="metric-row"><span class="metric-label">Next Payment Amt</span><span class="metric-value currency">${formatCurrency(f.nextPaymentAmount)}</span></div>
      <div class="utilization-bar-container">
        <div class="utilization-label"><span>Utilization</span><span>${f.utilizationRate.toFixed(1)}%</span></div>
        <div class="utilization-bar-bg"><div class="utilization-bar-fill" style="width:${Math.min(f.utilizationRate, 100)}%;background:${utilBarColor};"></div></div>
      </div>`;
  }

  function renderRisk(c) {
    const r = c.risk;
    const riskColor = r.tier === 'low' ? 'var(--risk-low)' : r.tier === 'moderate' ? 'var(--risk-moderate)' : 'var(--risk-high)';
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (r.score / 100) * circumference;
    document.getElementById('riskContent').innerHTML = `
      <div class="risk-gauge">
        <div class="risk-score-circle">
          <svg class="risk-score-svg" viewBox="0 0 120 120">
            <circle class="risk-score-bg" cx="60" cy="60" r="54" />
            <circle class="risk-score-fill" cx="60" cy="60" r="54" style="stroke:${riskColor};stroke-dasharray:${circumference};stroke-dashoffset:${offset};" />
          </svg>
          <div class="risk-score-inner">
            <div class="risk-score-number" style="color:${riskColor}">${r.score}</div>
            <div class="risk-score-label">${r.tier}</div>
          </div>
        </div>
      </div>
      <div class="risk-details">
        <div class="risk-detail-row"><span class="risk-detail-label">Bureau Score</span><span class="risk-detail-value">${r.creditBureauScore}</span></div>
        <div class="risk-detail-row"><span class="risk-detail-label">Defaults</span><span class="risk-detail-value" style="color:${r.defaults > 0 ? 'var(--risk-high)' : 'var(--risk-low)'}">${r.defaults}</span></div>
        <div class="risk-detail-row"><span class="risk-detail-label">Late Payments</span><span class="risk-detail-value" style="color:${r.latePayments > 5 ? 'var(--risk-moderate)' : 'var(--risk-low)'}">${r.latePayments}</span></div>
        <div class="risk-detail-row"><span class="risk-detail-label">Consecutive On-Time</span><span class="risk-detail-value" style="color:var(--risk-low)">${r.consecutiveOnTime}</span></div>
      </div>`;
  }

  function renderAccounts(c) {
    document.getElementById('accountCount').textContent = `${c.accounts.length} accounts`;
    const rows = c.accounts.map(a => {
      const v = getVendor(a.vendorId);
      const cat = v ? getCategory(v.category) : null;
      const pct = a.limit > 0 ? (a.balance / a.limit * 100) : 0;
      const barColor = pct < 30 ? 'var(--risk-low)' : pct < 70 ? 'var(--risk-moderate)' : 'var(--risk-high)';
      return `<tr>
        <td><div class="vendor-cell"><div class="vendor-logo">${v ? v.logo : '💳'}</div><div><div style="font-weight:600;">${v ? v.name : a.vendorId}</div>${cat ? `<div style="font-size:0.7rem;color:var(--text-muted);">${cat.icon} ${cat.name}</div>` : ''}</div></div></td>
        <td><span class="mono" style="font-size:0.78rem;color:var(--text-secondary);">${a.accountNumber}</span></td>
        <td><span style="font-family:'JetBrains Mono',monospace;font-weight:600;">${formatCurrency(a.balance)}</span><span style="color:var(--text-muted);font-size:0.72rem;"> / ${formatCurrency(a.limit)}</span><div class="balance-bar"><div class="balance-bar-fill" style="width:${pct}%;background:${barColor};"></div></div></td>
        <td><span class="status-${a.status}"><span class="status-dot"></span>${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span></td>
        <td style="color:var(--text-muted);font-size:0.78rem;">${formatDate(a.openedDate)}</td>
      </tr>`;
    }).join('');
    document.getElementById('accountsContent').innerHTML = `<table class="accounts-table"><thead><tr><th>Vendor</th><th>Account #</th><th>Balance / Limit</th><th>Status</th><th>Opened</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function renderPayments(c) {
    const sections = c.accounts.filter(a => a.paymentHistory && a.paymentHistory.length > 0).slice(0, 10).map(a => {
      const v = getVendor(a.vendorId);
      const grid = a.paymentHistory.map(p => {
        const shortMonth = p.month.split(' ')[0].substring(0, 3);
        return `<div class="payment-month"><div class="payment-month-label">${shortMonth}</div><div class="payment-dot ${p.status}" title="${p.month}: ${p.status}"></div></div>`;
      }).join('');
      return `<div class="account-payment-section"><div class="account-payment-label"><span>${v ? v.logo : '💳'}</span><span>${v ? v.name : a.vendorId}</span><span style="color:var(--text-muted);font-weight:400;font-size:0.72rem;margin-left:auto;">${a.accountNumber}</span></div><div class="payment-grid">${grid}</div></div>`;
    }).join('');
    document.getElementById('paymentsContent').innerHTML = sections + `<div class="payment-legend"><div class="legend-item"><div class="legend-dot on-time"></div> On-time</div><div class="legend-item"><div class="legend-dot late"></div> Late</div><div class="legend-item"><div class="legend-dot missed"></div> Missed</div></div>`;
  }

  function renderTimeline(c) {
    const typeColors = { payment:'#10b981', spend:'#6366f1', dispute:'#f59e0b', default:'#ef4444', collection:'#ef4444', kyc:'#06b6d4', reward:'#a855f7', credit_increase:'#3b82f6', credit_decrease:'#3b82f6', late_payment:'#f59e0b', settlement:'#f97316', account_open:'#10b981', account_closure:'#6b7280', dormancy:'#8b5cf6', winback:'#8b5cf6' };
    document.getElementById('timelineContent').innerHTML = '<div class="timeline">' + c.timeline.map((t, i) => {
      const color = typeColors[t.type] || '#6366f1';
      return `<div class="timeline-item" style="animation-delay:${i * 0.05}s"><div class="timeline-dot ${t.type}"></div><div class="timeline-date">${formatDate(t.date)}</div><div class="timeline-desc"><span class="timeline-type-badge" style="background:${color}22;color:${color};">${t.type.replace(/_/g, ' ')}</span>${t.description}</div>${t.amount ? `<div class="timeline-amount">${formatCurrency(t.amount)}</div>` : ''}</div>`;
    }).join('') + '</div>';
  }

  function renderVendors(c) {
    const vendorsByCategory = {};
    c.accounts.forEach(a => {
      const v = getVendor(a.vendorId);
      if (!v) return;
      const cat = getCategory(v.category);
      if (!vendorsByCategory[v.category]) vendorsByCategory[v.category] = { cat, vendors: [] };
      vendorsByCategory[v.category].vendors.push({ vendor: v, account: a });
    });
    let html = '';
    Object.values(vendorsByCategory).forEach(group => {
      html += `<div style="margin-bottom:12px;"><div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">${group.cat.icon} ${group.cat.name}</div><div class="vendor-cloud">${group.vendors.map(({ vendor: v, account: a }) => {
        const statusColor = a.status === 'active' ? group.cat.color : a.status === 'defaulted' ? 'var(--risk-high)' : 'var(--status-closed)';
        const opacity = a.status === 'closed' ? '0.5' : '1';
        return `<div class="vendor-chip" style="border-color:${statusColor};color:${statusColor};opacity:${opacity};"><span>${v.logo}</span> ${v.name}${a.status !== 'active' ? ` <span style="font-size:0.6rem;opacity:0.7;">(${a.status})</span>` : ''}</div>`;
      }).join('')}</div></div>`;
    });
    const active = c.accounts.filter(a => a.status === 'active').length;
    html = `<div style="font-size:0.78rem;color:var(--text-secondary);margin-bottom:12px;">${active} active · ${c.accounts.length - active} inactive</div>` + html;
    document.getElementById('vendorsContent').innerHTML = html;
  }

  function renderLTV(c) {
    const f = c.financial;
    document.getElementById('ltvContent').innerHTML = `
      <div class="ltv-grid">
        <div class="ltv-item"><div class="ltv-value">${formatCurrency(f.totalSpend)}</div><div class="ltv-label">Total Spend</div></div>
        <div class="ltv-item"><div class="ltv-value">${formatCurrency(f.avgMonthly)}</div><div class="ltv-label">Avg Monthly</div></div>
        <div class="ltv-item"><div class="ltv-value">${f.disputesFiled}</div><div class="ltv-label">Disputes Filed</div></div>
        <div class="ltv-item"><div class="ltv-value">${calculateTenure(c.customerSince)}</div><div class="ltv-label">Customer Tenure</div></div>
      </div>
      <div style="margin-top:16px;text-align:center;">
        <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Active Accounts</div>
        <div style="font-size:2rem;font-weight:800;color:var(--text-accent);font-family:'JetBrains Mono',monospace;">${c.accounts.filter(a => a.status === 'active').length}<span style="font-size:0.9rem;color:var(--text-muted);"> / ${c.accounts.length}</span></div>
      </div>`;
  }

  // ══════════════════════════════════════════════════
  // Q&A ENGINE
  // ══════════════════════════════════════════════════
  window._toggleQA = function () {
    qaOpen = !qaOpen;
    document.getElementById('qaPanel').classList.toggle('active', qaOpen);
    document.getElementById('qaToggle').style.display = qaOpen ? 'none' : '';
    if (qaOpen) document.getElementById('qaInput').focus();
  };

  function setupQA() {
    const input = document.getElementById('qaInput');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') window._askQuestion();
    });
  }

  window._askQuestion = async function () {
    const input = document.getElementById('qaInput');
    const q = input.value.trim();
    if (!q) return;
    input.value = '';

    addQAMsg(q, 'user');

    const thinkingId = 'qa-think-' + Date.now();
    const container = document.getElementById('qaMessages');
    const div = document.createElement('div');
    div.id = thinkingId;
    div.className = 'qa-msg qa-bot';
    div.innerHTML = `<div class="qa-msg-content" style="color:var(--text-muted);font-style:italic;">Querying RAG Engine...</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;

    try {
      const res = await fetch("http://127.0.0.1:8001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, top_k: 8 })
      });
      const data = await res.json();
      document.getElementById(thinkingId).remove();

      if (data.answer) {
        let formatted = data.answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\n/g, '<br/>');
        addQAMsg(formatted, 'bot');
      } else {
        addQAMsg(`<strong style="color:var(--risk-high)">Error:</strong> ${data.detail || 'Server error'}`, 'bot');
      }
    } catch (err) {
      document.getElementById(thinkingId).remove();
      addQAMsg(`<strong style="color:var(--risk-high)">Error:</strong> Could not connect to backend. Ensure FastAPI is running on port 8001.`, 'bot');
    }
  };

  function addQAMsg(content, role) {
    const container = document.getElementById('qaMessages');
    const div = document.createElement('div');
    div.className = `qa-msg qa-${role}`;
    div.innerHTML = `<div class="qa-msg-content">${content}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  // ── Boot ──
  document.addEventListener('DOMContentLoaded', init);
})();
