import { MOCK_JSON_LIST } from '@/app/comparator/mock-data'

export const MOCK_EXAMPLES = {
  Log: `${new Date().toISOString()} [INFO] ${JSON.stringify(
    {
      id: '18247328547325643825',
      filename: 'playlist.json',
      mimeType: 'application/json',
      content: JSON.stringify(MOCK_JSON_LIST, null, 2),
      updateTime: Date.now(),
    },
    null,
    2
  )}`,
  Curl: `curl 'https://example.com/api' \\
  -H 'accept: application/json, text/plain, */*' \\
  -H 'accept-language: en,zh;q=0.9,zh-CN;q=0.8' \\
  -H 'content-type: application/json' \\
  --data-raw '${JSON.stringify(MOCK_JSON_LIST).replaceAll("'", "\\'")}'`,
}
