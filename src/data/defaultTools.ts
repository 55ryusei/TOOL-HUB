import type { UserTool } from '../types'

/**
 * ここにデフォルトのツールを直書きします。
 * name（表示名）と url（リンク先）は必須。icon（絵文字）と sub（補足）は任意。
 * 画面の「＋ 追加」ボタンで足したものとは別管理（こちらは消えません）。
 * 並び順は画面上でドラッグして変更でき、その順番は保存されます。
 */
export const defaultTools: UserTool[] = [
  {
    id: 'def-kyuyo',
    name: '給与振込額計算',
    url: 'https://55ryusei.github.io/kyuyokeisan/',
    icon: '💰',
    sub: '給与計算',
  },
  {
    id: 'def-getumatu',
    name: '月末会計',
    url: 'https://55ryusei.github.io/getumartukaikei/',
    icon: '📅',
    sub: '会計',
  },
  {
    id: 'def-tc',
    name: 'TC',
    url: 'https://55ryusei.github.io/TCE4/',
    icon: '⏱',
    sub: 'TCE4',
  },
  {
    id: 'def-tce4sw',
    name: 'TCE4 SW',
    url: 'https://55ryusei.github.io/TCE4/swim.html',
    icon: '🏊',
    sub: 'Swim',
  },
  {
    id: 'def-tcc',
    name: 'TCC',
    url: 'https://55ryusei.github.io/TCE4/viewer.html',
    icon: '👁',
    sub: 'Viewer',
  },
  {
    id: 'def-chatbot',
    name: 'CHATBOT',
    url: 'https://hakutsuru-chat.hakutsuruchat.workers.dev/stats',
    icon: '🤖',
    sub: '統計',
  },
  {
    id: 'def-hp',
    name: 'HP',
    url: 'https://www.hakutsuru.ac.jp/',
    icon: '🏫',
    sub: '公式サイト',
  },
  {
    id: 'def-vercel',
    name: 'Vercel',
    url: 'https://hakutsturuhp1.vercel.app/',
    icon: '▲',
    sub: 'HP(Vercel)',
  },
  {
    id: 'def-tc4',
    name: 'TC4',
    url: 'https://55ryusei.github.io/TC_4/',
    icon: '🗂',
    sub: 'TC_4',
  },
]
