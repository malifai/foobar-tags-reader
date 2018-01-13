## Foobar2000 MP3 Tag Reader (ID3 Tag)

A simple (dependency free) package to read the id3 tags of a local mp3 file. Main purpose is to read custom tags from various foobar2000 plugins, e.g. playcount, rating, mood, added / played timestamps etc.
## Example

```
import { TrackInformation, getTags } from 'foobar-tags-reader';
	

getTags('/path/to/mp3').then((trackInformation: TrackInformation) => {
    console.log(trackInformation);	
}, (error: any) => {
    // invalid file / tag type
);
```

## Installation

```
npm install --save foobar-tags-rader
```

## Notes

This is basically a small helper package for another hobby project of mine. It's not considered to be used for any type of production apps. 
Feel free to contribute to this repo or email me about any kind of feedback or hints to improve the tag reader.
