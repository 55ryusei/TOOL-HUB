import type { Tool, UserTool } from '../types'
import { defaultTools } from '../data/defaultTools'

const STORAGE_KEY = 'toolhub.tools.v1'
const ORDER_KEY = 'toolhub.order.v1'
const FAV_KEY = 'toolhub.favorites.v1'
const HIDDEN_KEY = 'toolhub.hidden.v1'

/** 汎用：id配列を読む（壊れていたら空配列）。 */
function loadIds(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

function saveIds(key: string, ids: string[]): void {
  localStorage.setItem(key, JSON.stringify(ids))
}

/** localStorage からユーザー追加分を読む（壊れていたら空配列）。 */
export function loadUserTools(): UserTool[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (t): t is UserTool =>
        t && typeof t.id === 'string' && typeof t.name === 'string' && typeof t.url === 'string',
    )
  } catch {
    return []
  }
}

function saveUserTools(tools: UserTool[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tools))
}

/** 表示順（id配列）を保存する。 */
export function setOrder(ids: string[]): void {
  saveIds(ORDER_KEY, ids)
}

/** お気に入りを切り替え、保存後の全リストを返す。 */
export function toggleFavorite(id: string): Tool[] {
  const favs = loadIds(FAV_KEY)
  const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id]
  saveIds(FAV_KEY, next)
  return getAllTools()
}

/**
 * デフォルト(直書き) と ユーザー追加分をマージし、保存済みの順番に並べて返す。
 * - 非表示にしたデフォルトは除外。
 * - お気に入りフラグを付与。
 * - order に無い id（新規追加・後から増やしたデフォルト）は自然順で末尾に追加。
 */
export function getAllTools(): Tool[] {
  const favs = new Set(loadIds(FAV_KEY))
  const hidden = new Set(loadIds(HIDDEN_KEY))

  const defaults: Tool[] = defaultTools
    .filter((t) => !hidden.has(t.id))
    .map((t) => ({ ...t, source: 'default' as const, favorite: favs.has(t.id) }))
  const users: Tool[] = loadUserTools().map((t) => ({
    ...t,
    source: 'user' as const,
    favorite: favs.has(t.id),
  }))
  const merged = [...defaults, ...users]

  const order = loadIds(ORDER_KEY)
  if (order.length === 0) return merged

  const rank = new Map(order.map((id, i) => [id, i]))
  return merged
    .map((tool, i) => ({ tool, i }))
    .sort((a, b) => {
      const ra = rank.has(a.tool.id) ? rank.get(a.tool.id)! : Number.MAX_SAFE_INTEGER
      const rb = rank.has(b.tool.id) ? rank.get(b.tool.id)! : Number.MAX_SAFE_INTEGER
      // order にある同士は order 順、無いものは元の自然順で末尾へ
      return ra - rb || a.i - b.i
    })
    .map(({ tool }) => tool)
}

/** "example.com" のようにスキームが無ければ https:// を補う。 */
export function normalizeUrl(input: string): string {
  const url = input.trim()
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `https://${url}`
}

export function isValidUrl(input: string): boolean {
  try {
    const u = new URL(normalizeUrl(input))
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/** ユーザーツールを1件追加し、保存後の全リストを返す。 */
export function addTool(input: { name: string; url: string; icon?: string; sub?: string }): Tool[] {
  const tools = loadUserTools()
  const tool: UserTool = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: input.name.trim(),
    url: normalizeUrl(input.url),
    icon: input.icon?.trim() || undefined,
    sub: input.sub?.trim() || undefined,
  }
  saveUserTools([...tools, tool])
  return getAllTools()
}

/**
 * ツールを削除。ユーザー追加分はリストから除去、デフォルトは「非表示」として保存。
 * order / favorites からも除去する。保存後の全リストを返す。
 */
export function removeTool(id: string): Tool[] {
  const users = loadUserTools()
  if (users.some((t) => t.id === id)) {
    saveUserTools(users.filter((t) => t.id !== id))
  } else {
    // デフォルトは hidden に積んで非表示化
    const hidden = loadIds(HIDDEN_KEY)
    if (!hidden.includes(id)) saveIds(HIDDEN_KEY, [...hidden, id])
  }
  saveIds(ORDER_KEY, loadIds(ORDER_KEY).filter((oid) => oid !== id))
  saveIds(FAV_KEY, loadIds(FAV_KEY).filter((oid) => oid !== id))
  return getAllTools()
}
