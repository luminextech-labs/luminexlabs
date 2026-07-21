// LuminexLabs Chrome Extension — Content Script
// Scrapes data from TikTok pages

(function() {
  'use strict'

  // Detect which TikTok page we're on
  function detectPage() {
    const url = window.location.href

    if (url.includes('tiktokshop.com') || url.includes('tiktok.com/shop')) {
      return 'product'
    }
    if (url.includes('creator.tiktok.com')) {
      return 'creator'
    }
    if (url.includes('tiktok.com/@')) {
      return 'profile'
    }
    if (url.includes('tiktok.com/v/')) {
      return 'video'
    }
    return 'unknown'
  }

  // Scrape product data from TikTok Shop
  function scrapeProductPage() {
    const data = {}

    // Product title
    const titleEl = document.querySelector('[data-testid="product-title"]') ||
                    document.querySelector('h1') ||
                    document.querySelector('.product-title')
    data.name = titleEl ? titleEl.textContent.trim() : document.title

    // Price
    const priceEl = document.querySelector('[data-testid="product-price"]') ||
                    document.querySelector('.price') ||
                    document.querySelector('[class*="price"]')
    if (priceEl) {
      const priceText = priceEl.textContent.trim()
      data.price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0
    }

    // Image
    const imgEl = document.querySelector('[data-testid="product-image"] img') ||
                  document.querySelector('.product-image img') ||
                  document.querySelector('img[class*="product"]')
    data.image_url = imgEl ? imgEl.src : null

    // Product URL
    data.url = window.location.href

    // Commission rate (if visible)
    const commissionEl = document.querySelector('[class*="commission"]') ||
                         document.querySelector('[class*="affiliate"]')
    if (commissionEl) {
      const commText = commissionEl.textContent
      const commMatch = commText.match(/(\d+)%/)
      data.commission_rate = commMatch ? parseFloat(commMatch[1]) : null
    }

    return data
  }

  // Scrape creator dashboard data
  function scrapeCreatorPage() {
    const data = {}

    // Try to find commission/sales data
    const statEls = document.querySelectorAll('[class*="stat"]') ||
                    document.querySelectorAll('[class*="metric"]') ||
                    document.querySelectorAll('[class*="card"]')

    statEls.forEach(el => {
      const text = el.textContent
      if (text.includes('฿') || text.includes('THB')) {
        data.commission = parseFloat(text.replace(/[^0-9.]/g, '')) || 0
      }
      if (text.toLowerCase().includes('order') || text.toLowerCase().includes('sales')) {
        data.orders = parseInt(text.replace(/[^0-9]/g, '')) || 0
      }
    })

    // Try to find product list
    const productCards = document.querySelectorAll('[class*="product"]') ||
                        document.querySelectorAll('[class*="item"]')

    data.products = []
    productCards.forEach(card => {
      const nameEl = card.querySelector('a, h3, span')
      const priceEl = card.querySelector('[class*="price"]')
      const linkEl = card.querySelector('a')

      if (nameEl) {
        data.products.push({
          name: nameEl.textContent.trim(),
          price: priceEl ? parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')) : 0,
          url: linkEl ? linkEl.href : null
        })
      }
    })

    return data
  }

  // Scrape profile page
  function scrapeProfilePage() {
    const data = {}

    // Username
    const usernameEl = document.querySelector('[data-testid="username"]') ||
                       document.querySelector('h2[class*="username"]') ||
                       document.querySelector('[class*="nickname"]')
    data.username = usernameEl ? usernameEl.textContent.trim() : null

    // Bio link (might contain affiliate links)
    const bioLinks = document.querySelectorAll('[class*="bio"] a')
    data.bioLinks = Array.from(bioLinks).map(a => a.href)

    return data
  }

  // Main scrape function
  function scrape() {
    const pageType = detectPage()
    let data = {
      pageType,
      url: window.location.href,
      scrapedAt: new Date().toISOString()
    }

    switch (pageType) {
      case 'product':
        Object.assign(data, scrapeProductPage())
        break
      case 'creator':
        Object.assign(data, scrapeCreatorPage())
        break
      case 'profile':
        Object.assign(data, scrapeProfilePage())
        break
    }

    return data
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scrapeCurrentPage') {
      const data = scrape()
      sendResponse(data)
    }

    if (request.action === 'getCookies') {
      // Get cookies for current domain (for auth)
      chrome.cookies.getAll({ domain: '.tiktok.com' }, cookies => {
        sendResponse({ cookies })
      })
      return true // Keep channel open for async response
    }

    if (request.action === 'getLocalStorage') {
      // Get localStorage data
      const localStorage = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        localStorage[key] = localStorage.getItem(key)
      }
      sendResponse({ localStorage })
    }
  })

  // Notify background script on page load
  console.log('[LuminexLabs] Content script loaded on:', window.location.href)

})()
