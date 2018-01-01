import fs = require('fs');
import { TagReader } from './tag-reader';
import { TrackInformation } from './models/track-information.model';

const tagReader = new TagReader();

fs.open('src/assets/testfiles/2.mp3', 'r', async (error: any, data: any) => {
    if (error) {
        console.log(error.message);
        return;
    }

    let trackInformation: TrackInformation = await tagReader.read(data);
    console.log(trackInformation);
});
