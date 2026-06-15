export interface Tool {
  id: string
  name: string
  url: string
  /** 絵文字1文字など。任意。 */
  icon?: string
  /** カードに表示する補足テキスト。任意。 */
  sub?: string
  /** デフォルト(直書き) か ユーザー追加か。 */
  source: 'default' | 'user'
}

/** localStorage に保存するユーザー追加分（source は保存しない） */
export type UserTool = Omit<Tool, 'source'>
