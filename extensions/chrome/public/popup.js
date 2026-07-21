// LuminexLabs Chrome Extension — Popup Script

// Supabase config (matches .env.local)
const SUPABASE_URL = 'https://jumjddcqgjpgdoxffoag.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1bWpkZGNxZ2pwZ2RveGZmb2FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNDk1NDUsImV4cCI6MjA5OTkyNTU0NX0.VblTt-7ORicVUXsibXfKZfzyMa6-57JrhguXYctrXps'

// DOM elements
const statusDot = document.getElementById('statusDot')
const statusText = document.getElementById('statusText')
const statusTime = document.getElementById('statusTime')
const productList = document.getElementById('productList')
const statCommission = document.getElementById('statCommission')
const statOrders = document.getElementById('statOrders')
const toast = document.getElementById('toast')

function showToast(message, type = 'success') {
  toast.textContent = message
  toast.className = `toast show ${type}`
  setTimeout(() => toast.classList.remove('show'), 3000)
}

async function checkConnectionStatus() {
  try {
    const result = await chrome.runtime.sendMessage({ action: 'getConnectionStatus' })
    if (result.success && result.data.connected) {
      statusDot.className = 'status-dot connected'
      statusText.textContent = '✓ เชื่อมต่อแล้ว'
      statusTime.textContent = result.data.connectedAt
    } else {
      statusDot.className = 'status-dot warning'
      statusText.textContent = '⚠ ยังไม่เชื่อมต่อ'
      statusTime.textContent = ''
    }
  } catch {
    statusDot.className = 'status-dot'
    statusText.textContent = '• ไม่พบการเชื่อมต่อ'
  }
}

async function fetchCommissionStats() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/commissions?select=amount,status`, {
      headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
    })
    const data = await res.json()
    let total = 0, confirmed = 0
    for (const c of data) {
      total += parseFloat(c.amount) || 0
      if (c.status === 'confirmed') confirmed += parseFloat(c.amount) || 0
    }
    statCommission.textContent = `฿${Math.round(confirmed).toLocaleString()}`
    statOrders.textContent = data.length
  } catch {
    statCommission.textContent = '฿0'
    statOrders.textContent = '0'
  }
}

async function fetchProducts() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&limit=5&order=created_at.desc`, {
      headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
    })
    const data = await res.json()
    if (!data.length) {
      productList.innerHTML = '<div style="text-align:center;color:#666;padding:16px">ยังไม่มีสินค้า</div>'
      return
    }
    productList.innerHTML = data.map(p => `
      <div class="product-item">
        <div class="product-img" ${p.image_url ? `style="background-image:url(${p.image_url});background-size:cover"` : ''}></div>
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-meta">${p.platform} • ${p.commission_rate || 0}%</div>
        </div>
        <div class="product-price">฿${p.price || 0}</div>
      </div>
    `).join('')
  } catch {
    productList.innerHTML = '<div style="text-align:center;color:#ef4444;padding:16px">โหลดไม่ได้</div>'
  }
}

async function scrapeCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.url.includes('tiktok.com') && !tab.url.includes('tiktokshop.com')) {
      showToast('⚠ กรุณาเปิดหน้า TikTok ก่อน', 'error')
      return
    }

    showToast('🔍 กำลังดึงข้อมูล...')

    const result = await chrome.tabs.sendMessage(tab.id, { action: 'scrapeCurrentPage' })
    if (!result || result.pageType === 'unknown') {
      showToast('⚠ ไม่พบข้อมูลในหน้านี้', 'error')
      return
    }

    if (result.pageType === 'product' && result.name) {
      const productData = {
        user_id: '00000000-0000-0000-0000-000000000001',
        platform: 'tiktok',
        name: result.name,
        price: result.price || 0,
        commission_rate: result.commission_rate || 0,
        image_url: result.image_url || null,
        affiliate_link: result.url || null
      }

      const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(productData)
      })

      if (res.ok) {
        showToast('✅ บันทึกสินค้าแล้ว!')
        fetchProducts()
        fetchCommissionStats()
      } else {
        showToast('❌ เกิดข้อผิดพลาด', 'error')
      }
    } else {
      showToast(`📋 ดึงข้อมูลแล้ว: ${result.pageType}`, 'success')
    }
  } catch (err) {
    console.error('Scrape error:', err)
    showToast('❌ ไม่สามารถดึงข้อมูลได้', 'error')
  }
}

async function connectTikTok() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    if (!tab.url.includes('tiktok.com') && !tab.url.includes('tiktokshop.com')) {
      showToast('⚠ กรุณาเปิดหน้า TikTok ก่อน', 'error')
      return
    }

    showToast('🔗 กำลังเชื่อมต่อ...')

    // Get cookies from TikTok domain
    const cookies = await chrome.cookies.getAll({ domain: '.tiktok.com' })

    // Get localStorage from the page via content script
    let localStorageData = {}
    try {
      const lsResult = await chrome.tabs.sendMessage(tab.id, { action: 'getLocalStorage' })
      localStorageData = lsResult || {}
    } catch (e) {
      console.log('Could not get localStorage:', e)
    }

    // Save connection
    await chrome.storage.local.set({
      tiktokConnection: {
        cookies: cookies,
        localStorage: localStorageData,
        timestamp: Date.now(),
        url: tab.url
      }
    })

    showToast('✅ เชื่อมต่อ TikTok แล้ว!')
    checkConnectionStatus()
  } catch (err) {
    console.error('Connect error:', err)
    showToast('❌ เชื่อมต่อไม่ได้', 'error')
  }
}

// Event listeners
document.getElementById('btnScrapePage').addEventListener('click', scrapeCurrentPage)
document.getElementById('btnConnect').addEventListener('click', connectTikTok)
document.getElementById('btnRefreshData').addEventListener('click', () => {
  fetchProducts()
  fetchCommissionStats()
  showToast('🔄 รีเฟรชข้อมูลแล้ว')
})

document.getElementById('openDashboard').addEventListener('click', (e) => {
  e.preventDefault()
  chrome.tabs.create({ url: 'https://luminexlabs.com/dashboard' })
})

// Init
checkConnectionStatus()
fetchCommissionStats()
fetchProducts()
