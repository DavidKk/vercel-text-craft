import { MOCK_JSON_LIST } from '@/app/comparator/mock-data'

export const MOCK_STRING = JSON.stringify({
  id: '18247328547325643825',
  filename: 'palylist.json',
  mimeType: 'application/json',
  content: JSON.stringify(MOCK_JSON_LIST, null, 2),
  updateTime: Date.now(),
})
