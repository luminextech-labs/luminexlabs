// LuminexLabs Chrome Extension — Background Service Worker

const SUPABASE_URL = 'https://jumjddcqgjpgdoxffoag.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1bWpkZGNxZ2pwZ2RveGZmb2FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNDk1NDUsImV4cCI6MjA5OTkyNTU0NX0.VblTt-7ORicVUXsibXfKZfzyMa6-57JrhguXYctrXps'

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeTikTok') {
    scrapeTikTokData(request.data)
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }))
    return true
  }

  if (request.action === 'getProducts') {
    fetchProducts()
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }))
    return true
  }

  if (request.action === 'getCommissions') {
    fetchCommissions()
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }))
    return true
  }

  if (request.action === 'postToSupabase') {
    postToSupabase(request.table, request.data)
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err.message }))
    return true
  }

  if (request.action === 'getConnectionStatus') {
    getConnectionStatus()
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }))
    return true
  }
})

// Scrape data from TikTok pages
async function scrapeTikTokData(data) {
  const { type, pageData } = data

  // Store connection info
  if (type === 'connection') {
    await chrome.storage.local.set({
      tiktokConnection: {
        cookies: pageData.cookies,
        localStorage: pageData.localStorage,
        timestamp: Date.now()
      }
    })
  }

  return { received: true }
}

// Fetch products from Supabase
async function fetchProducts() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&limit=50`, {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`
    }
  })
  return res.json()
}

// Fetch commissions from Supabase
async function fetchCommissions() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/commissions?select=*&limit=50`, {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`
    }
  })
  return res.json()
}

// Post data to Supabase
async function postToSupabase(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err)
  }

  return res.json()
}

// Get TikTok connection status
async function getConnectionStatus() {
  const data = await chrome.storage.local.get(['tiktokConnection'])
  const conn = data.tiktokConnection

  if (!conn) return { connected: false }

  // Check if connection is less than 7 days old
  const sevenDays = 7 * 24 * 60 * 60 * 1000
  const isExpired = Date.now() - conn.timestamp > sevenDays

  return {
    connected: !isExpired,
    connectedAt: conn.timestamp ? new Date(conn.timestamp).toLocaleString() : null,
    expired: isExpired
  }
}
