import defaultSettings from '@/settings'

const title = defaultSettings.title || 'Vue Element Admin'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${'水产养殖管理系统'}`
  }
  return `${title}`
}
