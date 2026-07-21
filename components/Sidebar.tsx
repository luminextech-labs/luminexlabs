'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SIDEBAR_MENU } from '@/lib/types'

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-[#1a1a2e] border-r border-[#2a2a4a] flex flex-col h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#2a2a4a]">
        <Link href="/dashboard" className="text-lg font-bold text-purple-400 hover:text-purple-300 transition-colors">
          ⚡ LuminexLabs
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {SIDEBAR_MENU.map((section) => (
          <div key={section.section}>
            <div className="text-[10px] uppercase tracking-wider text-gray-600 px-3 pb-2">
              {section.section}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm
                      transition-all duration-150
                      ${isActive
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-gray-400 hover:bg-[#2a2a4a] hover:text-white'
                      }
                    `}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-[#2a2a4a]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2a2a4a] transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-semibold">
            M
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">Mind Trade</div>
            <div className="text-xs text-gray-500">@mindtrade89</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
