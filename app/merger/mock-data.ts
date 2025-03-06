export const MOCK_JSON_LIST = {
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
  classical: {
    name: 'Classical Music',
    description: 'A collection of classical music',
    list: [
      {
        songId: '1008',
        songName: 'Cello Suite No. 1',
        artist: 'Beethoven',
        album: 'Symphony No. 9',
      },
      {
        songId: '1009',
        songName: 'Moonlight Sonata',
        artist: 'Beethoven',
        album: 'Sonata No. 1',
      },
      {
        songId: '1009',
        songName: 'Moonlight Sonata',
        artist: 'Beethoven',
        album: 'Sonata No. 1',
      },
    ],
  },
}

export const MOCK_JSON_APPEND_LIST = [
  {
    songId: '1004',
    songName: 'Imagine',
    artist: 'John Lennon',
    album: 'Imagine',
  },
  {
    songId: '1005',
    songName: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    album: 'Appetite for Destruction',
  },
]

export const MOCK_TOML_LIST = `
[favorites]
name = "My Favorite Songs"
description = "A collection of favorite songs"

  [[favorites.list]]
  songId = "1006"
  songName = "Smells Like Teen Spirit"
  artist = "Nirvana"
  album = "Nevermind"
  duration = "05:01"
  url = "https://music.example.com/song?id=1006"

  [[favorites.list]]
  songId = "1007"
  songName = "Billie Jean"
  artist = "Michael Jackson"
  album = "Thriller"
  duration = "04:54"
  url = "https://music.example.com/song?id=1007"

[classical]
name = "Classical Music"
description = "A collection of classical music"

  [[classical.list]]
  songId = "1008"
  songName = "Cello Suite No. 1"
  artist = "Beethoven"
  album = "Symphony No. 9"

  [[classical.list]]
  songId = "1009"
  songName = "Moonlight Sonata"
  artist = "Beethoven"
  album = "Sonata No. 1"

  [[classical.list]]
  songId = "1009"
  songName = "Moonlight Sonata"
  artist = "Beethoven"
  album = "Sonata No. 1"
`

// [favorites]
// name = 'My Favorite Songs'
// description = 'A collection of favorite songs'
// list = [
//   { songId = '1006', songName = 'Smells Like Teen Spirit', artist = 'Nirvana', album = 'Nevermind', duration = '05:01', url = 'https://music.example.com/song?id=1006' },
//   { songId = '1007', songName = 'Billie Jean', artist = 'Michael Jackson', album = 'Thriller', duration = '04:54', url = 'https://music.example.com/song?id=1007' }
// ]
