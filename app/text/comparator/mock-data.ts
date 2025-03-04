export const mockTextList = `Bohemian Rhapsody
Stairway to Heaven
Imagine
Smells Like Teen Spirit
Like a Rolling Stone
Purple Rain
Wonderwall
Yesterday
Hey Jude
`

export const mockJsonList = [
  {
    songId: '1001',
    songName: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    duration: '05:55',
    url: 'https://music.example.com/song?id=1001',
  },
  {
    songId: '1003',
    songName: 'Hotel California',
    artist: 'Eagles',
    album: 'Hotel California',
    duration: '06:30',
    url: 'https://music.example.com/song?id=1003',
  },
  [
    {
      songId: '1004',
      songName: 'Imagine',
      artist: 'John Lennon',
      album: 'Imagine',
      duration: '03:03',
      url: 'https://music.example.com/song?id=1004',
    },
    {
      songId: '1005',
      songName: "Sweet Child O' Mine",
      artist: "Guns N' Roses",
      album: 'Appetite for Destruction',
      duration: '05:56',
      url: 'https://music.example.com/song?id=1005',
    },
  ],
  {
    favorites: {
      name: 'My Favorite Songs',
      description: 'A collection of favorite songs',
      list: [
        {
          songId: '1006',
          songName: 'Smells Like Teen Spirit',
          artist: 'Nirvana',
          album: 'Nevermind',
          duration: '05:01',
          url: 'https://music.example.com/song?id=1006',
        },
        {
          songId: '1007',
          songName: 'Billie Jean',
          artist: 'Michael Jackson',
          album: 'Thriller',
          duration: '04:54',
          url: 'https://music.example.com/song?id=1007',
        },
      ],
    },
  },
]

export const mockTomlList = `
# Song List in TOML format
[[songs]]
songId = "1001"
songName = "Bohemian Rhapsody"
artist = "Queen"
album = "A Night at the Opera"
duration = "05:55"
url = "https://music.example.com/song?id=1001"

[[songs]]
songId = "1002"
songName = "Stairway to Heaven"
artist = "Led Zeppelin"
album = "Led Zeppelin IV"
duration = "08:02"
url = "https://music.example.com/song?id=1002"

[[songs]]
songId = "1003"
songName = "Hotel California"
artist = "Eagles"
album = "Hotel California"
duration = "06:30"
url = "https://music.example.com/song?id=1003"
`
